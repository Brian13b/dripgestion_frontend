# DripGestión — Design System

Reglas para que toda la app (celular en la calle, tablet/escritorio en oficina) se vea y se sienta igual.
Estilo: limpio y cálido, alto contraste, con toques **Liquid Glass** solo donde aportan jerarquía.
Tokens en `src/index.css`; componentes en `src/components/primitives/`.

## 1. Color (roles semánticos)

| Rol | Token Tailwind | Uso |
|---|---|---|
| Primario (acento) | `primary` `#E86A1F` | Acción principal, ítem activo, foco |
| Primario suave | `primary-light` | Chips, fondos de ícono, texto secundario sobre header |
| Tinta / header | `primary-dark` `#1C1917` | Texto principal, headers, botón `dark` |
| Fondo | `background` `#F7F4F0` | Fondo de pantalla |
| Superficie | `surface` `#FFF` | Cards y modales |
| Arena | `sand-50/100/200` | Hover, bordes, inputs |
| Texto apagado | `secondary` | Descripciones, labels |
| Éxito / Peligro | `success` / `danger` | Cobros OK / acciones destructivas |

Regla: no usar `slate-*` ni colores sueltos para UI nueva; usar los roles de arriba.

## 2. Tipografía (Inter)

| Uso | Clases |
|---|---|
| Título de página | `text-2xl md:text-3xl font-bold tracking-tight` (lo aplica `PageHeader`) |
| Subtítulo de página | `text-sm md:text-base font-medium` |
| Título de card / sección | `text-lg font-bold` |
| Cuerpo | `text-sm` (`text-base` en reparto, para leer en la calle) |
| Label / eyebrow | utilidad `type-label` (12px, mayúsculas, tracking) |
| Badge | `text-xs font-bold` |

Evitar `text-4xl+` fuera de Login / hero del portal.

## 3. Alturas, radios y espaciado

- **Botones:** `sm` 36px · `md` 44px (mínimo táctil) · `lg` 56px (CTA principal en calle).
- **Inputs:** 44px (utilidad `field`).
- **Page header:** mínimo 96px, `px-5 md:px-12 lg:px-16`, `py-5 md:py-6`, sticky, `rounded-b-3xl`, borde inferior `primary` de 4px.
- **Radios:** botones/inputs `rounded-xl` (CTA `lg`: `rounded-2xl`) · cards `rounded-2xl`/`3xl` (utilidad `card`) · modales `rounded-3xl` · avatares/toggles `rounded-full`.
- **Contenedor:** `max-w-7xl mx-auto px-5 md:px-12 lg:px-16`; gaps de grilla `gap-4 md:gap-6`.

## 4. Liquid Glass

Utilidades `glass` (claro) y `glass-dark`: translucidez + `backdrop-blur` 16px + borde fino.
Usar en overlays, barras flotantes y paneles que se apoyan sobre contenido; no en cada card.

## 5. Botones — `components/primitives/Button.jsx`

```jsx
<Button variant="primary" size="md" leftIcon={<Plus size={18} />}>Guardar</Button>
<Button variant="soft" size="sm" iconOnly aria-label="Editar"><Pencil size={16} /></Button>
```

| `variant` | Cuándo |
|---|---|
| `primary` | Acción principal de la pantalla |
| `dark` | CTA alternativo sobre fondos claros (login, resumen) |
| `secondary` / `outline` / `ghost` | Acciones secundarias / terciarias |
| `soft` · `successSoft` · `dangerSoft` | Acciones de fila (editar / cobrar / borrar) |
| `success` · `danger` | Confirmar cobro / acción destructiva |
| `whatsapp` | Pedido por WhatsApp |
| `onDark` · `onDarkGhost` | Sobre el header oscuro |

Props: `size` (`sm|md|lg`), `iconOnly`, `fullWidth`, `isLoading`, `disabled`, `leftIcon`, `rightIcon`.
Estados incluidos: hover, press (`scale 0.964`), foco visible, disabled, loading.
**No crear `<button className="bg-... rounded-...">` nuevos**: usar `Button`.

## 6. Page header — `components/primitives/PageHeader.jsx`

```jsx
<PageHeader icon={Users} title="Clientes" subtitle="Gestión y saldo"
  actions={<HeaderAction icon={Plus} label="Nuevo Cliente" onClick={...} />} />
```

`onBack` muestra el botón volver; `eyebrow` el texto chico superior; `maxWidth` ajusta el ancho (reparto usa `max-w-3xl`).
`HeaderAction` muestra ícono + texto en desktop y solo ícono (44×44) en mobile.

## 7. Modales — `components/primitives/Modal.jsx`

```jsx
<Modal>                       {/* props: size="md|lg", tall, sheet */}
  <ModalHeader title="Nuevo Cliente" onClose={onClose} />
  <div className="p-6 overflow-y-auto flex-1">…</div>
  <ModalFooter><Button size="lg" fullWidth>Guardar</Button></ModalFooter>
</Modal>
```

Overlay `primary-dark/70` + blur, panel `rounded-3xl`, header/footer con la misma altura y borde. `sheet` = bottom-sheet en mobile. El botón de cierre es siempre `Button secondary sm iconOnly`.

## 8. Tabs y selectores — `components/primitives/SegmentedControl.jsx`

```jsx
<SegmentedControl value={tab} onChange={setTab}
  options={[{ value: 'a', label: 'Productos', icon: Package }, …]} />
```

`variant="stacked"` para menús laterales (columna en desktop, scroll horizontal en mobile); `fullWidth` para selectores de método de pago.

## 9. Comportamientos que se respetan

Sidebar colapsable (`lg:w-20` / `lg:w-64`) sincronizada con `lg:pl-20` / `lg:pl-64` en `App.jsx`, `BottomNav` en mobile.

## 10. Headers "hero"

`PerfilEmpresa`, `ResumenReparto` y `PortalClienteView` son pantallas de contexto propio (perfil, cierre de viaje, portal del cliente) y mantienen un header centrado más alto. Reglas compartidas: fondo `primary-dark` (o `success` en el resumen), `border-b-4 border-primary`, `rounded-b-3xl` y botones de ícono con `Button variant="onDarkGhost" iconOnly`.
Todo lo demás (incluido el panel SuperAdmin) usa `PageHeader`.

## 11. Pasos de reparto

Contadores +/− en `Button secondary iconOnly` (md en productos, sm en devolución directa); método de pago con `SegmentedControl size="lg"` (56px); Omitir / Confirmar son `Button lg` (`flex-1` / `flex-[2]`). Las filas de lista seleccionables siguen siendo `<button>` propios (no son acciones).

## 12. Inputs — clase `field`

```jsx
<input className="field" />                       {/* 44px, borde arena, foco naranja */}
<input className="field pl-11" />                 {/* con ícono a la izquierda */}
<input className="field field-lg font-black" />   {/* 56px: montos y datos clave en la calle */}
```

Aplica a `input`, `select` y `textarea`: `rounded-xl`, borde 2px `sand-200`, hover `primary-light`, foco `primary` + halo suave, texto 16px (evita el zoom de iOS). Está en `@layer components`, así que `pl-*`, `text-center`, `tracking-*` etc. la pisan sin problemas.
Excepciones: checkboxes, selector de color, filtros con fondo transparente dentro de barras y el input del contador de precios.

## 13. Pendiente

- Mensajes de lint previos (AuthContext, etc.), fuera del alcance del Design System.
- Revisión visual con sesión iniciada de cada pantalla (alineación de íconos dentro de inputs, altura de filas).
