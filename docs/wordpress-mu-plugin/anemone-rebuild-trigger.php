<?php
/**
 * Plugin Name: Anemone Rebuild Trigger
 * Description: WPコンテンツ更新時に GitHub Actions の repository_dispatch を呼び、静的サイト (anemone-web) を再ビルドする。短時間に複数の更新が来た場合は debounce で1回にまとめる。
 * Version: 1.0.0
 * Author: anemone-web team
 *
 * 設置方法:
 *   1. wp-config.php に以下2行を追記:
 *        define('ANEMONE_GH_TOKEN', 'github_pat_xxx_or_classic_token');
 *        define('ANEMONE_GH_REPO',  'n-hgc/anemone-web');
 *   2. このファイルを以下に配置:
 *        wp-content/mu-plugins/anemone-rebuild-trigger.php
 *      (mu-plugins ディレクトリが存在しない場合は作成する。 .htaccess不要)
 *
 * 動作:
 *   - 投稿/カスタム投稿/メディアの作成・更新・削除を検知
 *   - 検知から ANEMONE_REBUILD_DELAY_SECONDS 秒後に GitHub へ dispatch
 *   - 同じ debounce ウィンドウ内に追加の更新が来た場合は予約をキャンセルして再予約
 *   - その結果、連続編集10件 → ビルド1回 にまとまる
 */

if (!defined('ABSPATH')) {
    exit;
}

const ANEMONE_REBUILD_HOOK            = 'anemone_rebuild_dispatch';
const ANEMONE_REBUILD_DELAY_SECONDS   = 180; // 3分。短くしたいなら 60 など。
const ANEMONE_REBUILD_LOG_PREFIX      = '[anemone-rebuild] ';

/**
 * コンテンツ更新時に呼ばれるエントリーポイント。
 * debounce: 既存予約があれば破棄して再予約する。
 */
function anemone_schedule_rebuild($post_id = null, $post = null, $update = null) {
    // リビジョン・autosave・auto-draft は無視
    if ($post_id) {
        if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) {
            return;
        }
        if (wp_is_post_revision($post_id)) {
            return;
        }
        $p = $post ?: get_post($post_id);
        if ($p && $p->post_status === 'auto-draft') {
            return;
        }
    }

    // 既存スケジュールを全部キャンセル（multi-trigger を1本に集約するため）
    while (($next = wp_next_scheduled(ANEMONE_REBUILD_HOOK)) !== false) {
        wp_unschedule_event($next, ANEMONE_REBUILD_HOOK);
    }

    wp_schedule_single_event(time() + ANEMONE_REBUILD_DELAY_SECONDS, ANEMONE_REBUILD_HOOK);
}

/**
 * GitHub repository_dispatch API を実際に叩く。
 */
function anemone_dispatch_rebuild() {
    if (!defined('ANEMONE_GH_TOKEN') || !defined('ANEMONE_GH_REPO')) {
        error_log(ANEMONE_REBUILD_LOG_PREFIX . 'ANEMONE_GH_TOKEN or ANEMONE_GH_REPO is not defined in wp-config.php');
        return;
    }

    $url = 'https://api.github.com/repos/' . ANEMONE_GH_REPO . '/dispatches';

    $response = wp_remote_post($url, [
        'headers' => [
            'Authorization'        => 'Bearer ' . ANEMONE_GH_TOKEN,
            'Accept'               => 'application/vnd.github+json',
            'X-GitHub-Api-Version' => '2022-11-28',
            'User-Agent'           => 'anemone-rebuild-trigger',
            'Content-Type'         => 'application/json',
        ],
        'body' => wp_json_encode([
            'event_type'     => 'wp_content_changed',
            'client_payload' => [
                'triggered_at' => current_time('mysql'),
                'host'         => parse_url(home_url(), PHP_URL_HOST),
            ],
        ]),
        'timeout' => 15,
    ]);

    if (is_wp_error($response)) {
        error_log(ANEMONE_REBUILD_LOG_PREFIX . 'wp_remote_post error: ' . $response->get_error_message());
        return;
    }

    $code = wp_remote_retrieve_response_code($response);
    if ($code === 204) {
        error_log(ANEMONE_REBUILD_LOG_PREFIX . 'dispatched OK (HTTP 204)');
    } else {
        error_log(ANEMONE_REBUILD_LOG_PREFIX . 'dispatch failed: HTTP ' . $code . ' - ' . wp_remote_retrieve_body($response));
    }
}

// 投稿系
add_action('save_post',      'anemone_schedule_rebuild', 10, 3);
add_action('delete_post',    'anemone_schedule_rebuild', 10, 1);
add_action('trashed_post',   'anemone_schedule_rebuild', 10, 1);
add_action('untrashed_post', 'anemone_schedule_rebuild', 10, 1);

// メディア（画像差し替え等）
add_action('add_attachment',    'anemone_schedule_rebuild', 10, 1);
add_action('delete_attachment', 'anemone_schedule_rebuild', 10, 1);

// 実行
add_action(ANEMONE_REBUILD_HOOK, 'anemone_dispatch_rebuild');
