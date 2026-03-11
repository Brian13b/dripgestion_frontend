# 📱 DripGestión App - White-Label PWA

![Estado](https://img.shields.io/badge/Estado-En_Producción-success)
![PWA](https://img.shields.io/badge/PWA-Ready-f31260)
![React](https://img.shields.io/badge/React-Vite-61dafb?logo=react)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-38B2AC?logo=tailwind-css)
![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite)

Interfaz de usuario moderna y adaptativa para el ecosistema **DripGestión**. Diseñada con un enfoque Mobile-First para facilitar el trabajo de los choferes en calle y el autoservicio de los clientes.

## 🌟 Características Destacadas
* **Branding Dinámico:** La App detecta el subdominio y aplica automáticamente la identidad visual (colores y logos) de la distribuidora correspondiente.
* **Modo PWA:** Instalable en dispositivos iOS y Android como una aplicación nativa.
* **Portal de Clientes:** Interfaz simplificada para que los clientes finales consulten saldo, envases y realicen pedidos vía WhatsApp.
* **Dashboard Operativo:** Panel administrativo con métricas en tiempo real de recaudación y clientes activos.

## 🛠️ Stack Tecnológico
* **Vite + React**
* **Tailwind CSS** (Diseño responsivo y custom properties)
* **Lucide Icons** (Iconografía limpia)
* **Axios** (Gestión de peticiones con interceptores de seguridad)

## 🚀 Roadmap de UI/UX
- [ ] **Modo Offline total:** Sincronización diferida de datos en zonas sin señal.
- [ ] **Firma Digital:** Captura de firma del cliente al momento de la entrega.
- [ ] **Soporte Multi-lenguaje:** Preparación para mercados internacionales.
- [ ] **Dark Mode:** Adaptación visual para entregas nocturnas.

## 🚀 Configuración
1. `npm install`
2. Crear archivo `.env` con la variable `VITE_API_URL`.
3. `npm run dev` para desarrollo local.
4. `npm run build` para generar la versión de producción.

## 🎨 Personalización (Theming)
El sistema utiliza el `TenantContext` para inyectar variables CSS en el `:root` del documento, permitiendo cambios de tema sin recargar la aplicación ni duplicar código.

## 👨‍💻 Autores
Un producto desarrollado por **GB Soluciones Digitales**.

**Desarrollador Principal**: Brian Battauz ([@Brian13b](https://github.com/Brian13b))

---
> 🎯 *DripGestión no es solo una app, es la herramienta definitiva para digitalizar la distribución tradicional.*