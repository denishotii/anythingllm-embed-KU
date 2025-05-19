/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'false',
  prefix: 'allm-',
  corePlugins: {
    preflight: false,
  },
  content: {
    relative: true,
    files: [
      "./src/components/**/*.{js,jsx}",
      "./src/hooks/**/*.js",
      "./src/models/**/*.js",
      "./src/pages/**/*.{js,jsx}",
      "./src/utils/**/*.js",
      "./src/*.jsx",
      "./index.html",
    ]
  },
  theme: {
    extend: {
      rotate: {
        "270": "270deg",
        "360": "360deg"
      },
      colors: {
        "black-900": "#141414",
        accent: "#3D4147",
        "sidebar-button": "#31353A",
        sidebar: "#25272C",
        "historical-msg-system": "rgba(255, 255, 255, 0.05);",
        "historical-msg-user": "#2C2F35",
        outline: "#4E5153",
        "primary-button": "#46C8FF",
        secondary: "#2C2F36",
        "dark-input": "#18181B",
        "mobile-onboarding": "#2C2F35",
        "dark-highlight": "#1C1E21",
        "dark-text": "#222628",
        description: "#D2D5DB",
        "x-button": "#9CA3AF"
      },
      backgroundImage: {
        "preference-gradient":
          "linear-gradient(180deg, #5A5C63 0%, rgba(90, 92, 99, 0.28) 100%);",
        "chat-msg-user-gradient":
          "linear-gradient(180deg, #3D4147 0%, #2C2F35 100%);",
        "selected-preference-gradient":
          "linear-gradient(180deg, #313236 0%, rgba(63.40, 64.90, 70.13, 0) 100%);",
        "main-gradient": "linear-gradient(180deg, #3D4147 0%, #2C2F35 100%)",
        "modal-gradient": "linear-gradient(180deg, #3D4147 0%, #2C2F35 100%)",
        "sidebar-gradient": "linear-gradient(90deg, #5B616A 0%, #3F434B 100%)",
        "login-gradient": "linear-gradient(180deg, #3D4147 0%, #2C2F35 100%)",
        "menu-item-gradient":
          "linear-gradient(90deg, #3D4147 0%, #2C2F35 100%)",
        "menu-item-selected-gradient":
          "linear-gradient(90deg, #5B616A 0%, #3F434B 100%)",
        "workspace-item-gradient":
          "linear-gradient(90deg, #3D4147 0%, #2C2F35 100%)",
        "workspace-item-selected-gradient":
          "linear-gradient(90deg, #5B616A 0%, #3F434B 100%)",
        "switch-selected": "linear-gradient(146deg, #5B616A 0%, #3F434B 100%)"
      },
      fontFamily: {
        sans: [
          "plus-jakarta-sans",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          '"Helvetica Neue"',
          "Arial",
          '"Noto Sans"',
          "sans-serif",
          '"Apple Color Emoji"',
          '"Segoe UI Emoji"',
          '"Segoe UI Symbol"',
          '"Noto Color Emoji"'
        ]
      },
      animation: {
        sweep: "sweep 0.5s ease-in-out",
        'bounce-subtle': 'bounce-subtle 0.6s ease-in-out infinite',
        'shadow-bounce': 'shadow-bounce 0.6s ease-in-out infinite',
        'fly-in': 'fly-in 1.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'wiggle': 'wiggle 0.8s ease-in-out infinite',
        'wiggle-slow': 'wiggle-slow 1.5s ease-in-out infinite',
        'halo': 'halo 2s ease-in-out',
        'halo-hover': 'halo 1s ease-in-out infinite',
      },
      keyframes: {
        sweep: {
          "0%": { transform: "scaleX(0)", transformOrigin: "bottom left" },
          "100%": { transform: "scaleX(1)", transformOrigin: "bottom left" }
        },
        fadeIn: {
          "0%": { opacity: 0 },
          "100%": { opacity: 1 }
        },
        fadeOut: {
          "0%": { opacity: 1 },
          "100%": { opacity: 0 }
        },
        'bounce-subtle': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' }
        },
        'shadow-bounce': {
          '0%, 100%': { 
            transform: 'translateX(-50%) scale(1)'
          },
          '50%': { 
            transform: 'translateX(-50%) scale(0.85)'
          }
        },
        'fly-in': {
          '0%': { 
            transform: 'translateY(100vh) rotate(-10deg)',
            opacity: '0'
          },
          '60%': {
            transform: 'translateY(-20px) rotate(5deg)',
            opacity: '1'
          },
          '80%': {
            transform: 'translateY(10px) rotate(-2deg)',
            opacity: '1'
          },
          '100%': {
            transform: 'translateY(0) rotate(0)',
            opacity: '1'
          }
        },
        'wiggle': {
          '0%, 100%': { 
            transform: 'scale(1) rotate(0deg)',
            filter: 'brightness(1)'
          },
          '25%': { 
            transform: 'scale(1.05) rotate(5deg)',
            filter: 'brightness(1.1)'
          },
          '50%': { 
            transform: 'scale(0.95) rotate(-5deg)',
            filter: 'brightness(1.2)'
          },
          '75%': { 
            transform: 'scale(1.05) rotate(5deg)',
            filter: 'brightness(1.1)'
          }
        },
        'wiggle-slow': {
          '0%, 100%': { 
            transform: 'scale(1) rotate(0deg)',
            filter: 'brightness(1)'
          },
          '25%': { 
            transform: 'scale(1.03) rotate(3deg)',
            filter: 'brightness(1.05)'
          },
          '50%': { 
            transform: 'scale(0.98) rotate(-3deg)',
            filter: 'brightness(1.1)'
          },
          '75%': { 
            transform: 'scale(1.03) rotate(3deg)',
            filter: 'brightness(1.05)'
          }
        },
        'halo': {
          '0%': { 
            opacity: '0',
            transform: 'scale(1) rotate(0deg)',
            filter: 'blur(20px)'
          },
          '20%': { 
            opacity: '0.5',
            transform: 'scale(1.15) rotate(45deg)',
            filter: 'blur(15px)'
          },
          '40%': { 
            opacity: '0.3',
            transform: 'scale(1.1) rotate(90deg)',
            filter: 'blur(12px)'
          },
          '60%': { 
            opacity: '0.5',
            transform: 'scale(1.15) rotate(135deg)',
            filter: 'blur(15px)'
          },
          '80%': { 
            opacity: '0.2',
            transform: 'scale(1.1) rotate(180deg)',
            filter: 'blur(20px)'
          },
          '100%': { 
            opacity: '0',
            transform: 'scale(1) rotate(225deg)',
            filter: 'blur(25px)'
          }
        }
      }
    }
  },
  plugins: []
}
