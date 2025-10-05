module.exports = {
  "content": [
    "./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"
  ],
  "theme": {
    "extend": {
      "colors": {
        "black": "#3D3D3D",
        "grey_medium": "#A7A7A7",
        "grey_light": "#CFCFCF",
        "brown_dark": "#69552E",
        "brown_light": "#B8AA8C",
        "white": "#FFFFFF",
        "brown": "#69552E",
        "beige": "#FAF4E8",
        "text": {
          "black": "#3D3D3D",
          "grey_medium": "#878C92",
          "grey_light": "#B1B1B1",
          "brown_dark": "#69552E",
          "brown_light": "#B8AA8C",
          "white": "#FFFFFF"
        },
        "background": {
          "black": "#3D3D3D",
          "brown": "#69552E",
          "beige": "#FAF4E8",
          "white": "#FFFFFF"
        },
        "border": {
          "black": "#3D3D3D",
          "grey_medium": "#A7A7A7",
          "grey_light": "#CFCFCF",
          "white": "#FFFFFF"
        }
      },
      "spacing": {
        "small": "0.5rem",
        "medium": "1rem",
        "large": "2rem"
      },
      "fontSize": {
        "h2-pc": [
          "64px",
          {
            "lineHeight": "100%",
            "fontWeight": "500"
          }
        ],
        "h3-pc": [
          "24px",
          {
            "lineHeight": "150%",
            "fontWeight": "500"
          }
        ],
        "p-pc": [
          "16px",
          {
            "lineHeight": "150%",
            "fontWeight": "400"
          }
        ],
        "h2-sp": [
          "36px",
          {
            "lineHeight": "100%",
            "fontWeight": "500"
          }
        ],
        "h3-sp": [
          "20px",
          {
            "lineHeight": "150%",
            "fontWeight": "500"
          }
        ],
        "p-sp": [
          "16px",
          {
            "lineHeight": "150%",
            "fontWeight": "400"
          }
        ]
      },
      "fontFamily": {
        "yumincho": [
          "YuMincho",
          "serif"
        ],
        "zenkaku": [
          "ZenKakuGothicNew",
          "sans-serif"
        ]
      },
      "screens": {
        "pc": "768px",
        "sp": "767px"
      }
    }
  },
  "plugins": []
};