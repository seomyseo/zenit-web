# Diseño pendiente: Zenit

El pulido visual y las animaciones los decide el cliente más adelante. Hasta entonces el sitio usa estilos sobrios con los componentes actuales. Estos puntos quedan registrados para esa ronda; **no se aplican todavía**.

## Home

- ~~**Hero:** la foto del kit solar domina la composición~~. **Resuelto** con el hero A "Altura" (rotan bomba eléctrica sola, kit solar y refrigerante). Las variantes B y C siguen en `/lab/hero` como referencia.
- **Banner solar** ("Agua con la energía del sol"): la escena de cielo y campo es una ilustración con tonos derivados del verde. Si el cliente consigue una foto real de la bomba solar instalada en campo, reemplaza a la ilustración.

## Tarjetas de producto

- **Etiquetas de variación:** distinguir de un vistazo las variantes que hoy solo cambian en el nombre: aleación / cobre (bombas periféricas eléctricas) y hembra / macho (presostatos).
- **Espacio no separable entre número y unidad:** que "110-220 V", "1/2 HP", "20-40 PSI" no se corten entre el número y la unidad. Hoy solo se evita el corte en el guion del rango.
- **Descripciones en 2 líneas:** revisar que la descripción corta de cada tarjeta se lea completa o se corte en un punto natural en 2 líneas (hoy se recorta con "…").
- **Encuadre de las fotos:** margen y escala uniformes en todas las fotos (`object-contain`). Hoy los kits solares ocupan todo el cuadro y los presostatos o el control se ven más grandes o más chicos según la foto.
- **Modelo más visible:** el código comercial (ZBC-002S, ZBP-001A…) es lo primero que busca un ferretero; darle más peso en la tarjeta.

## Movimiento

- **Dirección definida: concepto "Altura"** (ver `CLAUDE.md`). Aplicado en el hero y el banner solar. Pendiente: llevarla a la entrada de las tarjetas del catálogo y al resto de secciones, que hoy solo tienen una entrada sutil.
