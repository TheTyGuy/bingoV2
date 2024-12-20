self.__BUILD_MANIFEST = {
  "polyfillFiles": [
    "static/chunks/polyfills.js"
  ],
  "devFiles": [
    "static/chunks/react-refresh.js"
  ],
  "ampDevFiles": [],
  "lowPriorityFiles": [],
  "rootMainFiles": [],
  "rootMainFilesTree": {},
  "pages": {
    "/": [
      "static/chunks/webpack.js",
      "static/chunks/main.js",
      "static/chunks/pages/index.js"
    ],
    "/_app": [
      "static/chunks/webpack.js",
      "static/chunks/main.js",
      "static/chunks/pages/_app.js"
    ],
    "/_error": [
      "static/chunks/webpack.js",
      "static/chunks/main.js",
      "static/chunks/pages/_error.js"
    ],
    "/collaborative-list/[lobbyCode]": [
      "static/chunks/webpack.js",
      "static/chunks/main.js",
      "static/chunks/pages/collaborative-list/[lobbyCode].js"
    ],
    "/game/[lobbyCode]": [
      "static/chunks/webpack.js",
      "static/chunks/main.js",
      "static/chunks/pages/game/[lobbyCode].js"
    ],
    "/join-lobby": [
      "static/chunks/webpack.js",
      "static/chunks/main.js",
      "static/chunks/pages/join-lobby.js"
    ],
    "/lobby/[lobbyCode]": [
      "static/chunks/webpack.js",
      "static/chunks/main.js",
      "static/chunks/pages/lobby/[lobbyCode].js"
    ],
    "/score/[lobbyCode]": [
      "static/chunks/webpack.js",
      "static/chunks/main.js",
      "static/chunks/pages/score/[lobbyCode].js"
    ],
    "/vote/[lobbyCode]": [
      "static/chunks/webpack.js",
      "static/chunks/main.js",
      "static/chunks/pages/vote/[lobbyCode].js"
    ]
  },
  "ampFirstPages": []
};
self.__BUILD_MANIFEST.lowPriorityFiles = [
"/static/" + process.env.__NEXT_BUILD_ID + "/_buildManifest.js",
,"/static/" + process.env.__NEXT_BUILD_ID + "/_ssgManifest.js",

];