<?php
/**
 * WordPress 5.8対応のfunctions.php設定
 * このファイルの内容をWordPressのfunctions.phpに追加してください
 */

// カスタム投稿タイプの登録
function register_salon_post_type() {
    $args = array(
        'public' => true,
        'show_in_rest' => true, // REST APIでアクセス可能
        'supports' => array('title', 'editor', 'thumbnail', 'custom-fields'),
        'has_archive' => true,
        'rewrite' => array('slug' => 'salon'),
        'labels' => array(
            'name' => '店舗情報',
            'singular_name' => '店舗',
            'add_new' => '新規追加',
            'add_new_item' => '新しい店舗を追加',
            'edit_item' => '店舗を編集',
            'new_item' => '新しい店舗',
            'view_item' => '店舗を表示',
            'search_items' => '店舗を検索',
            'not_found' => '店舗が見つかりません',
            'not_found_in_trash' => 'ゴミ箱に店舗はありません'
        ),
        'menu_icon' => 'dashicons-store',
        'menu_position' => 5
    );
    register_post_type('salon', $args);
}
add_action('init', 'register_salon_post_type');

// カスタム分類の登録
function register_salon_taxonomies() {
    // 地域分類
    register_taxonomy('salon_region', 'salon', array(
        'hierarchical' => true,
        'show_in_rest' => true,
        'labels' => array(
            'name' => '地域',
            'singular_name' => '地域',
            'search_items' => '地域を検索',
            'all_items' => 'すべての地域',
            'parent_item' => '親地域',
            'parent_item_colon' => '親地域:',
            'edit_item' => '地域を編集',
            'update_item' => '地域を更新',
            'add_new_item' => '新しい地域を追加',
            'new_item_name' => '新しい地域名',
            'menu_name' => '地域'
        ),
        'rewrite' => array('slug' => 'region')
    ));

    // 都道府県分類
    register_taxonomy('salon_prefecture', 'salon', array(
        'hierarchical' => true,
        'show_in_rest' => true,
        'labels' => array(
            'name' => '都道府県',
            'singular_name' => '都道府県'
        ),
        'rewrite' => array('slug' => 'prefecture')
    ));

    // 市区町村分類
    register_taxonomy('salon_city', 'salon', array(
        'hierarchical' => true,
        'show_in_rest' => true,
        'labels' => array(
            'name' => '市区町村',
            'singular_name' => '市区町村'
        ),
        'rewrite' => array('slug' => 'city')
    ));

    // 採用状況分類
    register_taxonomy('recruit_status', 'salon', array(
        'hierarchical' => false,
        'show_in_rest' => true,
        'labels' => array(
            'name' => '採用状況',
            'singular_name' => '採用状況'
        ),
        'rewrite' => array('slug' => 'recruit-status')
    ));

    // 職種分類
    register_taxonomy('job_type', 'salon', array(
        'hierarchical' => false,
        'show_in_rest' => true,
        'labels' => array(
            'name' => '職種',
            'singular_name' => '職種'
        ),
        'rewrite' => array('slug' => 'job-type')
    ));

    // 雇用形態分類
    register_taxonomy('employment_type', 'salon', array(
        'hierarchical' => false,
        'show_in_rest' => true,
        'labels' => array(
            'name' => '雇用形態',
            'singular_name' => '雇用形態'
        ),
        'rewrite' => array('slug' => 'employment-type')
    ));
}
add_action('init', 'register_salon_taxonomies');

// カスタム投稿タイプ「リクルート動画」の登録
function register_recruit_video_post_type() {
    $args = array(
        'public' => true,
        'show_in_rest' => true, // REST APIでアクセス可能
        'supports' => array('title', 'thumbnail', 'custom-fields'),
        'has_archive' => false,
        'rewrite' => array('slug' => 'recruit-video'),
        'labels' => array(
            'name' => 'リクルート動画',
            'singular_name' => 'リクルート動画',
            'add_new' => '新規追加',
            'add_new_item' => '新しい動画を追加',
            'edit_item' => '動画を編集',
            'search_items' => '動画を検索',
            'not_found' => '見つかりません'
        ),
        'menu_icon' => 'dashicons-video-alt3',
        'menu_position' => 6
    );
    register_post_type('recruit_video', $args);
}
add_action('init', 'register_recruit_video_post_type');

// リクルート動画用タクソノミー（表示用フラグなど）の登録
function register_recruit_video_taxonomies() {
    register_taxonomy('recruit_video_category', 'recruit_video', array(
        'hierarchical' => true,
        'show_in_rest' => true,
        'labels' => array(
            'name' => '動画カテゴリ',
            'singular_name' => '動画カテゴリ',
            'menu_name' => '動画カテゴリ'
        ),
        'rewrite' => array('slug' => 'recruit-video-category')
    ));
}
add_action('init', 'register_recruit_video_taxonomies');

// ACFフィールドをREST APIで公開（WordPress 5.8対応）
function add_acf_meta_to_rest() {
    $post_types = array('salon', 'recruit_video');
    foreach ($post_types as $post_type) {
        register_rest_field($post_type, 'acf', array(
            'get_callback' => function($post) {
                return get_fields($post['id']);
            },
            'update_callback' => null,
            'schema' => null
        ));
    }
}
add_action('rest_api_init', 'add_acf_meta_to_rest');

// CORS設定（フロントエンドからのアクセス許可）
function add_cors_http_header(){
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization");
}
add_action('init','add_cors_http_header');

// REST APIのレスポンスにカスタムフィールドを含める
function add_custom_fields_to_rest() {
    $post_types = array('salon', 'recruit_video');
    foreach ($post_types as $post_type) {
        register_rest_field($post_type, 'meta', array(
            'get_callback' => function($post) {
                return get_post_meta($post['id']);
            },
            'update_callback' => null,
            'schema' => null
        ));
    }
}
add_action('rest_api_init', 'add_custom_fields_to_rest');

// カスタム投稿タイプのスラッグをREST APIで使用
function add_slug_to_rest() {
    $post_types = array('salon', 'recruit_video');
    foreach ($post_types as $post_type) {
        register_rest_field($post_type, 'slug', array(
            'get_callback' => function($post) {
                return get_post_field('post_name', $post['id']);
            },
            'update_callback' => null,
            'schema' => null
        ));
    }
}
add_action('rest_api_init', 'add_slug_to_rest');
?>
