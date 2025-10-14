// 認証チェック用のJavaScript
(function() {
    'use strict';
    
    // 認証状態をチェック
    function checkAuthStatus() {
        const isAuthenticated = sessionStorage.getItem('authenticated') === 'true';
        const authTime = sessionStorage.getItem('authTime');
        const currentTime = Date.now();
        const authTimeout = 24 * 60 * 60 * 1000; // 24時間
        
        if (isAuthenticated && authTime && (currentTime - parseInt(authTime)) < authTimeout) {
            return true;
        } else if (isAuthenticated) {
            // 認証が期限切れの場合
            sessionStorage.removeItem('authenticated');
            sessionStorage.removeItem('username');
            sessionStorage.removeItem('authTime');
        }
        return false;
    }
    
    // 認証ページにリダイレクト
    function redirectToAuth() {
        window.location.href = '/';
    }
    
    // 認証チェックを実行
    if (!checkAuthStatus()) {
        redirectToAuth();
    }
})();
