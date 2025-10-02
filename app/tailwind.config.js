module.exports = {
  "content": [
    "./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"
  ],
  "theme": {
    "extend": {
      "colors": {
        "primary": {
          "value": "#ec4899",
          "description": "メインカラー"
        },
        "secondary": {
          "value": "#8b5cf6",
          "description": "セカンダリカラー"
        },
        "brand": {
          "50": "#fdf2f8",
          "100": "#fce7f3",
          "200": "#fbcfe8",
          "300": "#f9a8d4",
          "400": "#f472b6",
          "500": "#ec4899",
          "600": "#db2777",
          "700": "#be185d",
          "800": "#9d174d",
          "900": "#831843"
        }
      },
      "spacing": {
        "small": {
          "value": "0.5rem",
          "description": "小さいスペース"
        },
        "medium": {
          "value": "1rem",
          "description": "中程度のスペース"
        },
        "large": {
          "value": "2rem",
          "description": "大きいスペース"
        }
      },
      "fontSize": {
        "heading-large": {
          "fontSize": "2rem",
          "fontWeight": "700",
          "lineHeight": "1.2",
          "description": ""
        },
        "body-medium": {
          "fontSize": "1rem",
          "fontWeight": "400",
          "lineHeight": "1.5",
          "description": ""
        }
      },
      "fontFamily": {
        "sans": [
          "Inter",
          "system-ui",
          "sans-serif"
        ]
      }
    }
  },
  "plugins": []
};