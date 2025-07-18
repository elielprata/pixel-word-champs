
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					darker: 'hsl(var(--primary-darker))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'fade-in': {
					'0%': {
						opacity: '0',
						transform: 'translateY(10px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'scale-in': {
					'0%': {
						transform: 'scale(0.95)',
						opacity: '0'
					},
					'100%': {
						transform: 'scale(1)',
						opacity: '1'
					}
				},
				'bounce-in': {
					'0%': {
						transform: 'scale(0.3)',
						opacity: '0'
					},
					'50%': {
						transform: 'scale(1.05)'
					},
					'70%': {
						transform: 'scale(0.9)'
					},
					'100%': {
						transform: 'scale(1)',
						opacity: '1'
					}
				},
				'word-reveal': {
					'0%': {
						transform: 'scale(0.8) rotate(-5deg)',
						opacity: '0',
						filter: 'blur(2px)'
					},
					'50%': {
						transform: 'scale(1.1) rotate(0deg)',
						opacity: '0.8',
						filter: 'blur(0px)'
					},
					'100%': {
						transform: 'scale(1.05) rotate(0deg)',
						opacity: '1',
						filter: 'blur(0px)'
					}
				},
				'oval-glow': {
					'0%, 100%': {
						boxShadow: '0 0 8px rgba(59, 130, 246, 0.4), 0 0 16px rgba(59, 130, 246, 0.2)'
					},
					'50%': {
						boxShadow: '0 0 16px rgba(59, 130, 246, 0.6), 0 0 32px rgba(59, 130, 246, 0.3)'
					}
				},
				'cell-glow': {
					'0%, 100%': {
						boxShadow: '0 0 5px rgba(99, 102, 241, 0.5)'
					},
					'50%': {
						boxShadow: '0 0 20px rgba(99, 102, 241, 0.8), 0 0 30px rgba(99, 102, 241, 0.6)'
					}
				},
				'celebration-sparkle': {
					'0%': {
						transform: 'translateY(0) rotate(0deg)',
						opacity: '1'
					},
					'100%': {
						transform: 'translateY(-20px) rotate(360deg)',
						opacity: '0'
					}
				},
				'color-shift': {
					'0%': {
						filter: 'hue-rotate(0deg) saturate(1)'
					},
					'25%': {
						filter: 'hue-rotate(5deg) saturate(1.1)'
					},
					'50%': {
						filter: 'hue-rotate(0deg) saturate(1.2)'
					},
					'75%': {
						filter: 'hue-rotate(-5deg) saturate(1.1)'
					},
					'100%': {
						filter: 'hue-rotate(0deg) saturate(1)'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.3s ease-out',
				'scale-in': 'scale-in 0.2s ease-out',
				'bounce-in': 'bounce-in 0.6s ease-out',
				'word-reveal': 'word-reveal 1s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
				'oval-glow': 'oval-glow 2s ease-in-out infinite',
				'cell-glow': 'cell-glow 2s ease-in-out infinite',
				'celebration-sparkle': 'celebration-sparkle 1.5s ease-out infinite',
				'color-shift': 'color-shift 3s ease-in-out infinite'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
