# Genshin Impact : Elite Enemies RTA Leader Boards

このプロジェクトは、原神の「幻想シアター」におけるタイムアタック記録を収集・閲覧するためのWebアプリケーションです。

## 主な機能

*   **記録の閲覧**:
    *   **フィルタリング**: 名前検索、複数キャラクター指定（AND検索）、除外設定（OR条件）、ワールドレベル（WL）、コスト（低凸/無制限）、元素別フィルタなどが可能です。
    *   カテゴリ別表示（NPuI, PuI, PuA, Enkanomiya, Local Legend）。
*   **記録の投稿**:
    *   クリアタイム、パーティ編成、使用武器などを登録できます。
    *   自動的にカテゴリ（Low/High）を判定します。

## 技術スタック

*   **Framework**: [Next.js](https://nextjs.org) (App Router)
*   **Styling**: [Tailwind CSS](https://tailwindcss.com)
*   **Database**: [Supabase](https://supabase.com)
*   **UI Library**: Framer Motion (Animations), Lucide React (Icons)

## ローカルでの実行方法

1.  依存関係のインストール:
    ```bash
    npm install
    # or
    yarn
    ```

2.  環境変数の設定:
    `.env.local` ファイルを作成し、Supabaseの接続情報を記述してください。

3.  開発サーバーの起動:
    ```bash
    npm run dev
    ```

    [http://localhost:3000](http://localhost:3000) にアクセスして確認できます。
