# Administración de planes — verificación

## Resultado

Tres categorías con una colección vigente común para tarjetas, contadores y selectores. Editor lateral único, publicación inmediata, acciones fijas, errores por campo y conservación de valores tras fallos. Precios mensuales y anuales visibles; ahorro anual y descuento del combo separados. Los beneficios existentes conservan sus descripciones, visibilidad y secciones al editar.

El tema claro se hereda desde `AdminLayout`; el diálogo nativo renderizado en portal recibe explícitamente `admin-theme`. El resto de la aplicación conserva su tema base. No se incorporaron dependencias.

## Capturas reales

Capturadas en Chromium contra Django local con una base de verificación aislada, inicializada con las migraciones existentes. No son mockups ni capturas de producción. Escritorio: 1440 × 1500; móvil: 390 × 1000. En móvil las capturas muestran el primer tramo del catálogo desplazable.

| Vista | Escritorio | Móvil |
| --- | --- | --- |
| Facturación | [Captura](facturacion-desktop.png) | [Captura](facturacion-mobile.png) |
| Nómina | [Captura](nomina-desktop.png) | [Captura](nomina-mobile.png) |
| Combos | [Captura](combos-desktop.png) | [Captura](combos-mobile.png) |
| Editor de plan | [Captura](editor-plan-desktop.png) | [Captura](editor-plan-mobile.png) |
| Editor de combo | [Captura](editor-combo-desktop.png) | [Captura](editor-combo-mobile.png) |

## Verificaciones

- `npm test`: 4 pruebas de ahorro, descuentos, importes indefinidos y redondeo.
- `npm run build`: TypeScript y Vite correctos.
- Backend: 20 pruebas de API; publicación, edición, permisos, persistencia, precios inválidos, ceros frente a nulos, catálogo vigente y combos.
- `makemigrations --check --dry-run`: sin cambios de esquema pendientes de generar.
- Chromium: 360, 390, 768, 1280, 1440 y 1920 px, tres categorías y editor. Sin overflow horizontal de página ni diálogo; pie visible y categoría preseleccionada. Dos columnas a 1280 con el menú lateral; tres a 1440 y 1920.
- Creación y edición de un plan con recarga para comprobar persistencia; creación de combo al 5 % y plan de nómina por cotización. Registros de prueba eliminados exclusivamente de la base aislada después de verificar.
- Descuento inválido rechazado por Django, error junto al campo y nombre introducido conservado; guardado exitoso al corregirlo.
- Tabulación contenida en el diálogo (40 pulsaciones), Escape y restauración del foco. Pestañas con flechas/Home/End y desplegables nativos accesibles.
- Estado vacío, error de catálogo y reintento comprobados con respuestas interceptadas únicamente para esos estados de interfaz.
- Revisión del tema compartido en usuarios y empresas.
- Contraste calculado: texto principal/blanco 13,72:1; texto secundario/fondo 5,60:1; acción azul/blanco 5,10:1; borde de control/blanco 3,16:1; ahorro/blanco 7,68:1.

## Archivos modificados

Frontend:
- `src/pages/admin/AdminPlansPage.tsx`
- `src/pages/admin/PlanCard.tsx`
- `src/pages/admin/PlanEditorDialog.tsx`
- `src/pages/admin/planEditorConfig.ts`
- `src/pages/admin/planPresentation.ts`
- `src/pages/admin/planCatalog.css`
- `src/components/layout/AdminLayout.tsx`
- `src/styles/globals.css`
- `src/types/index.ts`
- `tailwind.config.ts`, `package.json`, `tests/plan-pricing.test.mjs`
- Este informe y diez capturas.

Backend (repositorio independiente):
- `apps/plans/models.py`, `serializers.py`, `views.py`, `tests.py`
- `apps/plans/migrations/0008_bundle_presentation.py`
- `apps/plans/migrations/0009_restore_seeded_quote_unknowns.py`
- `README.md`

## Despliegue y límites de la verificación

Aplicar primero las migraciones del backend y después desplegar el frontend. `0008` añade modalidad y beneficios opcionales al combo. `0009` repara únicamente los ceros de marcador que `0007` escribió en la oferta empresarial personalizada identificada por código, modalidad y descripción; conserva cantidades concretas y no modifica precios ni descuentos. No elimina planes ni referencias históricas.

La configuración habitual de MySQL no se modificó. Las pruebas automatizadas y del navegador usaron SQLite aislado y caché en memoria; queda por ejecutar la migración y el smoke test en el entorno MySQL de despliegue. No se comprobó Safari/iOS ni teclado virtual de un dispositivo físico.

Avisos preexistentes de Vite: script de configuración runtime, clase `duration-[220ms]` y tamaño del bundle. En desarrollo `env-config.js` devuelve 404 porque se genera en el despliegue. El proyecto no dispone de ESLint en sus dependencias ni configuración; se validó con TypeScript, build y pruebas.
