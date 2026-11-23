# Pendientes de contenido: Zenit

Lo que se omitió, se corrigió o se publicó con reservas al cargar los productos (noviembre 2026).
Cuando llegue la ficha o la confirmación del cliente, corregir el JSON en `content/products/` y tachar aquí.

Fuentes usadas, en orden de prioridad:
1. Fichas técnicas: `FICHA TECNICA *.pdf` y `*.jpg`.
2. Nombre del producto en el ERP: `Lista de Productos Zenit.pdf`.
3. Empaques: `EMPAQUE *.pdf` y `DISEÑO DE EMPAQUE *.pdf`. Solo los datos que concuerdan entre sí y con el nombre del ERP.

## ⚠️ Validar con el cliente antes de producción

Estos datos salen **solo del empaque** (no hay ficha técnica) y están publicados:

| Producto | Datos de una sola fuente |
| --- | --- |
| 0021-0314 Bomba centrífuga cobre 1 HP | Modelo ZBC-002C; 750 W; 60 Hz; bobinas de cobre; agua limpia; usos (doméstico, jardinería, depósitos); instalación (lugar cubierto, máx. 40 °C) |
| 0021-0310 Bomba periférica aleación 1/2 HP | Modelo ZBP-001A; 370 W; 60 Hz; 35 m; 35 L/min; bobinas de aleación; tapón de purga; soporte de fijación; instalación |
| 0021-0312 Bomba periférica cobre 1/2 HP | Modelo ZBP-001C; 370 W; 60 Hz; 35 m; 35 L/min; bobinas de cobre; tapón de purga; soporte de fijación; instalación |
| 0021-0332 / 0021-0331 Presostatos | Equivalencia 1,4-2,8 bar; campo de regulación 1,4-4,6 bar; diferencial mín. 1,0-2,1 bar y máx. 1,2-2,3 bar; rosca 1/4" gas; palanca de apagado automático |
| 0021-0330 Control de presión | 60 Hz; 10 A; 1,1 kW; arranque 1,5 bar; máx. 10 bar; conexión G 1"; máx. 60 °C; IP65 |
| 2352-0124 / 2352-0125 Refrigerantes | "Gasolina, diésel, híbridos y eléctricos" y "protege contra la oxidación y la corrosión" salen de la etiqueta del galón que se ve en la ficha |

## Correcciones aplicadas (brief, sección 5)

- **ZBC-002S y ZBP-001S:** no se publica la curva de rendimiento (llega a 350 L/min y 16 m, no coincide con 42 L/min y 45 m, ni con 32 L/min y 35 m). Las dos fichas traen la misma curva.
- **ZBP-001S:** voltaje del motor publicado como **48 V DC**. La pág. 3 de la ficha dice DC72V; por eso **su diagrama de conexión no se publica**. "Tipo de bomba" publicado como "Periférica superficial solar" (la ficha dice "Centrífuga superficial solar").
- **Refrigerantes:** no se publican "Conductividad" (98.9), "Concentración de refrigerante" (122 °C) ni "Cambio o sustitución" (cada 6 meses).
- Ortografía corregida al transcribir: "anonizado" → "anodizado", tildes ("Eléctrico", "máxima", "Distribución"), "Policristalino" → "Policristalina" (celda).
- Formato es-VE: decimales con coma (43,58 V; pH 8,81) y miles con punto. La ficha de refrigerante dice "3,785 ml" y se publica **3.785 ml** (un galón).

## Datos omitidos por contradicción

- **0021-0314 Bomba centrífuga cobre (eléctrica):** altura y caudal. El empaque dice 45 m / 42 L/min en el frente y 30 m / 100 L/min en la tabla.
- **0021-0330 Control de presión:** voltaje. Se publica **110/120 V** (nombre del ERP); el empaque dice 110-220 V.
- **ZBC-002S:** la columna "Voltaje DC 90-120 V" de la pág. 2 no se publica: no coincide con los 72 V del motor. Tampoco se publica la columna "48-50 V" de ZBP-001S, porque no está claro qué mide.
- **ZBS-001S:** la característica "Temperatura nominal celda 45 °C" no se publica (la tabla dice 44 ± 2 °C).
- **ZBS-001S, empaque:** dice 1 HP, 750 W, 110/220 V, 95 m, 72 Hz, 1060 × 220 × 140 mm, y el archivo se llama "2 ETAPAS". La ficha (0,5 HP, 72 V DC, 33 m, 6 etapas) manda.
- **Empaques solares de ZBC-002S y ZBP-001S:** traen la tabla de la versión eléctrica (110/220 V, 750 W o 370 W, 30 m / 100 L/min, "72 Hz"). No se usan.
- **Garantía de los empaques:** dicen "1 año". Se publica 1 año **solo en las 6 bombas** (decisión del cliente). Presostatos, control y refrigerantes van sin garantía hasta que se confirme.

## Datos que no existen en ninguna fuente

- **Fichas técnicas de los 6 productos sin ficha** (3 bombas eléctricas, 2 presostatos, control): no hay PDF, curva ni diagrama.
- **Bombas eléctricas:** diámetros de succión y descarga, tipo de impulsor, peso, medidas; altura y caudal de la centrífuga (ver arriba).
- **Presostatos:** modelo (el empaque dice "ZPH-000X" y "ZPM-000X", parecen marcadores). La tabla "Características eléctricas" (110 V: 1.1/2 HP y 2 HP; 220 V: 2 HP y 3 HP; 380 V; "32 V"; columna "-" con 1/4 HP) es ambigua y no se publica.
- **Control de presión:** modelo (el empaque dice "ZPC-000X").
- **Refrigerantes:** modelo comercial (solo hay código ERP).

## Archivos y fotos

- **Botón "Descargar ficha técnica (PDF)": ningún producto lo tiene por ahora.** Los PDF de las bombas solares traen el lema que no se usa ("Impulsando el mañana…"), las curvas erróneas y DC72V en ZBP-001S. Hace falta una versión corregida para publicarlos.
- Publicados como imagen: curva y conexión de ZBS-001S; conexión de los paneles de ZBC-002S.
- **0021-0310 y 0021-0312** usan la misma foto (archivos idénticos). Falta una foto propia de cada una.
- Una sola foto por producto, 1200 × 1200 px. Faltan los originales en alta resolución y fotos adicionales para la galería.
- `EMPAQUE CONTROLADOR DE PANEL SOLAR.pdf` describe un controlador para cargar baterías; no corresponde a ninguno de los 11 productos. Se ignora.
