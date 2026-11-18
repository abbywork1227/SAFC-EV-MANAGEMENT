# V8 hotfix

修正「我要管理」進入管理後台白畫面的問題。

原因：ExtrasView.vue 在 setup 中呼叫了未匯入的 Vue lifecycle/watch API，且公告預覽計時器引用了未定義的 previewSlides，導致元件初始化時發生錯誤。

修正：移除管理頁面中不必要且未完成的公告輪播預覽計時器程式碼。待機首頁輪播仍由 EntryScreen.vue 負責，不受影響。

啟動方式：npm install；npm run dev。
