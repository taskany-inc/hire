# Changelog

All notable changes to this project will be documented in this file. See [conventional commits](https://www.conventionalcommits.org/en/v1.0.0/) for commit guidelines.

## [0.9.2](https://github.com/taskany-inc/hire/compare/v0.9.1...v0.9.2) (2023-10-05)


### Bug Fixes

* infinite redirect to locale fix ([2d3830d](https://github.com/taskany-inc/hire/commit/2d3830d70aa3d4ca4ac6b3f607de45c6f0b40c4f))

## [0.9.1](https://github.com/taskany-inc/hire/compare/v0.9.0...v0.9.1) (2023-10-04)


### Reverts

* Revert "chore(deps): bump rrule from 2.6.8 to 2.7.2" ([6fe17d3](https://github.com/taskany-inc/hire/commit/6fe17d3954c84b166fb7b76bb4b0c1923a210038))

## [0.9.0](https://github.com/taskany-inc/hire/compare/v0.8.3...v0.9.0) (2023-10-04)


### Features

* middleware to redirect on locale from Accept-Language header ([06b0995](https://github.com/taskany-inc/hire/commit/06b0995f93a790b633b581c300452c91db34438b))


### Bug Fixes

* **ExternalUserLink:** add NEXT_PUBLIC_ to SOURCE_OF_USERS_URL ([4947f4e](https://github.com/taskany-inc/hire/commit/4947f4e7c24101a4bb546e6d3ad1e276cde335a9))
* **TitleMenu:** add color textColor for IconMoreVerticalSolid in trigger button ([fdffe2e](https://github.com/taskany-inc/hire/commit/fdffe2ea7676244777ed37fc9a29cce336358288))

## [0.8.3](https://github.com/taskany-inc/hire/compare/v0.8.2...v0.8.3) (2023-09-25)


### Bug Fixes

* **Header:** preserve locale in links ([1e31056](https://github.com/taskany-inc/hire/commit/1e31056d23c078bda1b38178bcede975fc7489e9))

## [0.8.2](https://github.com/taskany-inc/hire/compare/v0.8.1...v0.8.2) (2023-09-18)


### Bug Fixes

* **analytics:** convert bigint counts to number ([92e812d](https://github.com/taskany-inc/hire/commit/92e812d78fbf42b42a01a05576efcbe851851463))

## [0.8.1](https://github.com/taskany-inc/hire/compare/v0.8.0...v0.8.1) (2023-09-14)


### Bug Fixes

* **links:** preserve locale ([6535a7b](https://github.com/taskany-inc/hire/commit/6535a7b1048a224fdfdcf7fd2c066bbdc85578b5))

## [0.8.0](https://github.com/taskany-inc/hire/compare/v0.7.0...v0.8.0) (2023-09-11)


### Features

* feedback button as in issues ([95a8939](https://github.com/taskany-inc/hire/commit/95a89394efcdd88e0980e01426ebb3cbfb0eb629))
* **FormGradeDropdown:** select grade by dropdown ([9d3338a](https://github.com/taskany-inc/hire/commit/9d3338adadb5a2a7b6496220779b836c29a30031))


### Bug Fixes

* **avatars:** correctly use UserPic component ([bba2cd6](https://github.com/taskany-inc/hire/commit/bba2cd6f90631fcb41aefe22f4f3077fc80aca34))
* **PageHeader:** change change prop avatar to email un UserMenu ([da08e5d](https://github.com/taskany-inc/hire/commit/da08e5d7623c986a1aae71a33245af57de7498f1))

## [0.7.0](https://github.com/taskany-inc/hire/compare/v0.6.2...v0.7.0) (2023-08-30)


### Features

* icons from taskany icons ([98eab22](https://github.com/taskany-inc/hire/commit/98eab2202579d39f77493538ffe4465720145d9d))


### Bug Fixes

* **Docker:** bump next because of env fix ([057d617](https://github.com/taskany-inc/hire/commit/057d617264e9a54507bd304a2d7f854c2798645f))
* **ssr:** serialize props with superjson ([604a973](https://github.com/taskany-inc/hire/commit/604a9739f7cab65dbbfb528ab0dab1d9da5be3f6))

## [0.6.2](https://github.com/taskany-inc/hire/compare/v0.6.1...v0.6.2) (2023-08-28)


### Bug Fixes

* **Docker:** upgrade prisma, fix docker build ([e1522ab](https://github.com/taskany-inc/hire/commit/e1522abcc5b5d0abb2ad6f215752e3026eb527e1))

## [0.6.1](https://github.com/taskany-inc/hire/compare/v0.6.0...v0.6.1) (2023-08-24)


### Bug Fixes

* **build:** removed getEnvOrThrow ([cdad637](https://github.com/taskany-inc/hire/commit/cdad637a5e4bb7463ddd0592ecdf3707bd5c99b1))

## [0.6.0](https://github.com/taskany-inc/hire/compare/v0.5.3...v0.6.0) (2023-08-24)


### Features

* **HireStreams:** access to managing hire streams in header ([94e4173](https://github.com/taskany-inc/hire/commit/94e4173b1b25e726e6844d7f28effbc13444b8c0))
* **HireStreams:** add role to user by combobox ([9c971e0](https://github.com/taskany-inc/hire/commit/9c971e0a79555da48ff1f451307350951192c89b))
* **Section:** choose interviewer to section by combobox ([5a80319](https://github.com/taskany-inc/hire/commit/5a8031979d5d38f2362fade9a072e8e207622a61))


### Bug Fixes

* **Analytics:** filter allowed hire streams ([ed88089](https://github.com/taskany-inc/hire/commit/ed8808908d4e7b38b70c26784b4dcb3bd528187e))

## [0.5.3](https://github.com/taskany-inc/hire/compare/v0.5.2...v0.5.3) (2023-08-17)


### Bug Fixes

* **Build:** init trpc relative url ([e0b5cf9](https://github.com/taskany-inc/hire/commit/e0b5cf9855fbc132f530ff4e10c40ccb51a9e89b))

## [0.5.2](https://github.com/taskany-inc/hire/compare/v0.5.1...v0.5.2) (2023-08-16)


### Bug Fixes

* **Build:** add concurrently for future worker support ([615cbd1](https://github.com/taskany-inc/hire/commit/615cbd1b958c6e8f0ab973e1f5f4746b57df8473))
* **Build:** bump next.js minor ([75bc89c](https://github.com/taskany-inc/hire/commit/75bc89c1204bf2766cfc83317963b47b320ed8a1))

## [0.5.1](https://github.com/taskany-inc/hire/compare/v0.5.0...v0.5.1) (2023-08-16)


### Bug Fixes

* **Build:** add concurrently for future worker support ([f609bba](https://github.com/taskany-inc/hire/commit/f609bba3a481dc03e1755adfb2e1667fe92339d1))

## [0.5.0](https://github.com/taskany-inc/hire/compare/v0.4.0...v0.5.0) (2023-08-16)


### Features

* **MarkdownRenderer:** syntax highlight ([b2817bf](https://github.com/taskany-inc/hire/commit/b2817bf2be0e8eae9271c8c9f75a3bc5e32577cc))
* **SectionFeedback:** add attaches by FormEditor ([719e9c6](https://github.com/taskany-inc/hire/commit/719e9c62a5faa3d0caee5b5257623371b92c5f3b))


### Bug Fixes

* add problem popup doesn't have a header ([99130e6](https://github.com/taskany-inc/hire/commit/99130e6eeb8dfe85e5aa1cbb1ae8c8f977df3163))
* all action buttons should be outline ([a9cbc3c](https://github.com/taskany-inc/hire/commit/a9cbc3c6aece61f271f08416faa1547758106084))
* calendar popup issues ([886e6eb](https://github.com/taskany-inc/hire/commit/886e6eb6b20ce7bb791971b6c51f3cb088212f20))
* **db schema:** use utc timestamps ([1667dec](https://github.com/taskany-inc/hire/commit/1667decb0534afe716335e92d57b2e5bb415019c))
* header bugs ([8f445cb](https://github.com/taskany-inc/hire/commit/8f445cb443affb1ac476f200e9b65d44a7bcd02b))
* header bugs ([7b188b8](https://github.com/taskany-inc/hire/commit/7b188b87ef402d84e5dbc6b711e04c5ede6aa9a6))
* **SectionFeedback:** fix hidration error ([8f31eca](https://github.com/taskany-inc/hire/commit/8f31ecab6ac04a3fb8f1c42f9cdabae230e9030c))
* **Select:** Button as renderTrigger in Dropdown ([2926d65](https://github.com/taskany-inc/hire/commit/2926d659ee0eda37cc4eab638cbec6b089d45a06))

## [0.4.0](https://github.com/taskany-inc/hire/compare/v0.3.15...v0.4.0) (2023-08-07)


### Features

* i18n/ru on the backend ([#86](https://github.com/taskany-inc/hire/issues/86)) ([0bf4f9b](https://github.com/taskany-inc/hire/commit/0bf4f9b611590ff2134b3d4e3f693dab889ce8a6))
* **SectionType grades:** store grade options in db ([a96d269](https://github.com/taskany-inc/hire/commit/a96d2695618738f2dbe120776e2d3736f0d6ffff))
* Support i18n/ru ([#79](https://github.com/taskany-inc/hire/issues/79)) ([ca73c58](https://github.com/taskany-inc/hire/commit/ca73c585f99ca262bb0f13169095251d99b3348f))


### Bug Fixes

* analytics custom period modal layuot ([#84](https://github.com/taskany-inc/hire/issues/84)) ([7f9ee27](https://github.com/taskany-inc/hire/commit/7f9ee27c9c437f24e93ef72bb555ed56c75a110a))
* i18n support ([#42](https://github.com/taskany-inc/hire/issues/42)) ([da8a12b](https://github.com/taskany-inc/hire/commit/da8a12bca11ea82368659eea7c52f9dff61b43c8))
* i18n/ru ([#91](https://github.com/taskany-inc/hire/issues/91)) ([81502d8](https://github.com/taskany-inc/hire/commit/81502d8249319a47cbefdc4d4414f16cdd328483))
* input in user search ([#83](https://github.com/taskany-inc/hire/issues/83)) ([ce9d160](https://github.com/taskany-inc/hire/commit/ce9d16070489e0427e899cf075ef05cd4e3e6292))
* **MarkdownRenderer:** added useMarkdown hook ([#100](https://github.com/taskany-inc/hire/issues/100)) ([3f43bd7](https://github.com/taskany-inc/hire/commit/3f43bd7380d6edbc9da2ecb97cd52949b574909e))
* **Section:** redirect to correct interviewId ([#94](https://github.com/taskany-inc/hire/issues/94)) ([a753d66](https://github.com/taskany-inc/hire/commit/a753d66976ec25bb19cbfba0edc5d71a741e78e7))
* user list previews do not lay one on another ([#88](https://github.com/taskany-inc/hire/issues/88)) ([bd9d672](https://github.com/taskany-inc/hire/commit/bd9d6720e85d315bc6a3c58929bca6761ba1cef1))

## [0.3.15](https://github.com/taskany-inc/hire/compare/v0.3.14...v0.3.15) (2023-07-20)


### Bug Fixes

* api helth always returns 200 ([#80](https://github.com/taskany-inc/hire/issues/80)) ([2a1ffb8](https://github.com/taskany-inc/hire/commit/2a1ffb84d1d4fa87e5b6fd8551df0febb08622da))

## [0.3.14](https://github.com/taskany-inc/hire/compare/v0.3.13...v0.3.14) (2023-07-18)


### Bug Fixes

* refresh lock file ([#77](https://github.com/taskany-inc/hire/issues/77)) ([d5fe8be](https://github.com/taskany-inc/hire/commit/d5fe8beae237d7326020ed25829efcc4b6187133))

## [0.3.13](https://github.com/taskany-inc/hire/compare/v0.3.12...v0.3.13) (2023-07-17)


### Bug Fixes

* remove concurrently from deps ([#74](https://github.com/taskany-inc/hire/issues/74)) ([0068322](https://github.com/taskany-inc/hire/commit/00683220b20c23ce4a903050479778dfe62a8026))

## [0.3.12](https://github.com/taskany-inc/hire/compare/v0.3.11...v0.3.12) (2023-07-14)


### Bug Fixes

* add concurrently to deps ([#72](https://github.com/taskany-inc/hire/issues/72)) ([d16f147](https://github.com/taskany-inc/hire/commit/d16f14722ec07aa6e6d1424a6103d568a9173897))

## [0.3.11](https://github.com/taskany-inc/hire/compare/v0.3.10...v0.3.11) (2023-07-14)


### Bug Fixes

* add src to copy from build ([#70](https://github.com/taskany-inc/hire/issues/70)) ([6043a7d](https://github.com/taskany-inc/hire/commit/6043a7d04f88722c414c57c82b1a33eaddabf441))

## [0.3.10](https://github.com/taskany-inc/hire/compare/v0.3.9...v0.3.10) (2023-07-13)


### Bug Fixes

* default values for autocomplete ([#67](https://github.com/taskany-inc/hire/issues/67)) ([62a9f8e](https://github.com/taskany-inc/hire/commit/62a9f8e2b1ef7ee9318637d9cb772d9b7ca80ea1))

## [0.3.9](https://github.com/taskany-inc/hire/compare/v0.3.8...v0.3.9) (2023-07-10)


### Bug Fixes

* remove generate color from seed scritp ([#65](https://github.com/taskany-inc/hire/issues/65)) ([cffa91f](https://github.com/taskany-inc/hire/commit/cffa91f3ead815d188dc3f54e70271bf85c41e4a))

## [0.3.8](https://github.com/taskany-inc/hire/compare/v0.3.7...v0.3.8) (2023-07-07)


### Bug Fixes

* move seed script to backend scripts ([#63](https://github.com/taskany-inc/hire/issues/63)) ([f70f470](https://github.com/taskany-inc/hire/commit/f70f4703427718246f869105ea041a23a244e034))

## [0.3.7](https://github.com/taskany-inc/hire/compare/v0.3.6...v0.3.7) (2023-07-04)


### Bug Fixes

* update react-diff-viewer ([#61](https://github.com/taskany-inc/hire/issues/61)) ([fdb7d08](https://github.com/taskany-inc/hire/commit/fdb7d081ee9e6dea97ef02c8a482f1ba891f3bd3))

## [0.3.6](https://github.com/taskany-inc/hire/compare/v0.3.5...v0.3.6) (2023-07-04)


### Bug Fixes

* added legacy-peer-deps for react-diff-viewer ([#59](https://github.com/taskany-inc/hire/issues/59)) ([605a696](https://github.com/taskany-inc/hire/commit/605a69608fa19da15643f7f83eca4c71ac40b936))

## [0.3.5](https://github.com/taskany-inc/hire/compare/v0.3.4...v0.3.5) (2023-07-04)


### Bug Fixes

* added database url for docker build ([#57](https://github.com/taskany-inc/hire/issues/57)) ([6c88967](https://github.com/taskany-inc/hire/commit/6c88967256be62e9da935e764f81e14bcf6c31c9))

## [0.3.4](https://github.com/taskany-inc/hire/compare/v0.3.3...v0.3.4) (2023-07-04)


### Bug Fixes

* added swc packages ([caf8ee4](https://github.com/taskany-inc/hire/commit/caf8ee457f21d1d3b4c7a7ed33b9e27f7c75e7f3))

## [0.3.3](https://github.com/taskany-inc/hire/compare/v0.3.2...v0.3.3) (2023-07-04)


### Bug Fixes

* detect next build time ([2a32fc9](https://github.com/taskany-inc/hire/commit/2a32fc94bda7a856194fa42d18e708a38e550d9a))

## [0.3.2](https://github.com/taskany-inc/hire/compare/v0.3.1...v0.3.2) (2023-07-04)


### Bug Fixes

* removed unused vars ([ee81e17](https://github.com/taskany-inc/hire/commit/ee81e17cfe0364892558e3cc8fc8d47b47dc7e03))

## [0.3.1](https://github.com/taskany-inc/hire/compare/v0.3.0...v0.3.1) (2023-07-03)


### Bug Fixes

* add arg ci in dockerfile ([271c5e3](https://github.com/taskany-inc/hire/commit/271c5e306b2cbc5750c2562304ef75747518ed3d))

## [0.3.0](https://github.com/taskany-inc/hire/compare/v0.2.0...v0.3.0) (2023-07-03)


### Features

* styled calendar ([7300d4d](https://github.com/taskany-inc/hire/commit/7300d4d432fdba9bd54e45950ab0a41985931afc))


### Bug Fixes

* env variable name fix ([bbd0434](https://github.com/taskany-inc/hire/commit/bbd0434872aedc141ef6c892f18b7811fc310f85))

## 0.2.0 (2023-06-26)


### Features

* code for hire ([ab710de](https://github.com/taskany-inc/hire/commit/ab710de0aca46cebfbf1668d623270375076773e))
* code useKeyboard from bricks ([3ae9f23](https://github.com/taskany-inc/hire/commit/3ae9f2370b30d1061779566e57ad222296bb0e52))
* configs and linters like in issues ([4e4a957](https://github.com/taskany-inc/hire/commit/4e4a95794f71db392d68649b53af7a7501489dc9))
* custom grade options ([ffbe5f8](https://github.com/taskany-inc/hire/commit/ffbe5f843ae03c073275b5ea681927ba8fd94bb2))
* docker for hire ([b5a1b4b](https://github.com/taskany-inc/hire/commit/b5a1b4be8b87ba428be56f6b80ca654b39170219))
* offline detector from bricks ([c3aaf12](https://github.com/taskany-inc/hire/commit/c3aaf12536525e7a72faf2f5b82e09f86d961ed1))
* prisma init ([e21be0b](https://github.com/taskany-inc/hire/commit/e21be0b8dde649f1682dc33d667ac184c8cecacf))
* seed script for database ([0e38280](https://github.com/taskany-inc/hire/commit/0e38280e4ec7cca7a98be1a873a5187f68a178aa))
* starting nextjs project ([c2d9b09](https://github.com/taskany-inc/hire/commit/c2d9b09a97c0c2f3ccc6dcaa8df1df5916181641))


### Bug Fixes

* **SectionTypeCard:** fix typo in TickCircleIcon ([49b2de9](https://github.com/taskany-inc/hire/commit/49b2de99ca5ccf53347c9a3c14d90f3b411928b6))
* superjson-next plugin for babel added ([ac2573d](https://github.com/taskany-inc/hire/commit/ac2573d6b463c7b6dadfd4fc8349f32633f76f58))
* vendors for seed script ([d7aaf90](https://github.com/taskany-inc/hire/commit/d7aaf90aca2c07370db65b066a0d019097debf89))
