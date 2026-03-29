const path = require('path');

// resolve @commitlint/config-conventional from the _amu package dir
const conventionalPath = require.resolve('@commitlint/config-conventional', {
  paths: [path.resolve(__dirname, '../_amu')],
});

module.exports = {
  // commitlint は extends に文字列（モジュール名またはパス）を期待するため、
  // _amu 側にあるパッケージの解決パスを与える
  extends: [conventionalPath],
  // カスタムルールを inline plugin として定義
  plugins: [
    {
      rules: {
        'header-issue': (parsed) => {
          const header = (parsed.header || '').trim();
          const ok = /#\d+$/.test(header);
          return [
            ok,
            'コミットメッセージの先頭行は末尾に GitHub issue (#123) を含める必要があります。',
          ];
        },
      },
    },
  ],
  rules: {
    // 日本語や Sentence case を許容するため subject-case を無効化
    'subject-case': [0, 'never'],
    // header-issue を必須にする
    'header-issue': [2, 'always', true],
  },
};
