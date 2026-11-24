# Diseño pendiente: Zenit

El pulido visual y las animaciones los decide el cliente más adelante. Hasta entonces el sitio usa estilos sobrios con los componentes actuales. Estos puntos quedan registrados para esa ronda; **no se aplican todavía**.

## Home

- ~~**Hero:** la foto del kit solar domina la composición~~. **Resuelto** con el hero A "Altura" (rotan bomba eléctrica sola, kit solar y refrigerante). Las variantes B y C siguen en `/lab/hero` como referencia.
- **Banner solar** ("Agua con la energía del sol"): la escena de cielo y campo es una ilustración con tonos derivados del verde. Si el cliente consigue una foto real de la bomba solar instalada en campo, reemplaza a la ilustración.

## Tarjetas de producto

**Resuelto con la tarjeta C "Riel" en grilla** (elegida por el cliente, sin carrusel: todas las tarjetas a la vista). Las propuestas A y B siguen en `/lab/tarjetas` como referencia.

- ~~**Etiquetas de variación**~~: etiqueta blanca sobre la foto (Cobre / Aleación, Hembra / Macho, Rojo / Verde).
- ~~**Espacio no separable entre número y unidad**~~: en nombres y cifras de la tarjeta (`keepTogether` en `lib/card-data.ts`).
- ~~**Descripciones en 2 líneas**~~: la tarjeta ya no lleva descripción; en su lugar, hasta 3 cifras clave de la ficha.
- **Encuadre de las fotos:** margen uniforme (10 %) en todas; pendiente solo que el cliente entregue fotos con escala pareja (el control y los presostatos se ven más grandes que las bombas).
- ~~**Modelo más visible**~~: etiqueta negra sobre la foto (o el tipo de producto si no tiene modelo).

## Movimiento

- **Dirección definida: concepto "Altura"** (ver `CLAUDE.md`). Aplicado en el hero, el banner solar y las tarjetas del catálogo (entran desde la derecha; banda diagonal verde al pasar el mouse). Pendiente: el resto de secciones, que hoy solo tienen una entrada sutil.
