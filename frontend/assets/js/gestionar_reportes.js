/* ============================================================
   SIGAS — Sistema de Reportes
   Conecta con /api/reportes
   ACTUALIZADO: Filtro de fechas funcional + descarga filtrada
   ============================================================ */

const API_REPORTES = 'http://localhost:3000/api/reportes';

// reporteActual → guarda TODO lo que devolvió el servidor (sin filtrar)
let reporteActual = null;  // { tipo, titulo, data[] }

// datosVisibles → guarda lo que se está mostrando ahora (puede ser filtrado)
let datosVisibles = null;  // { tipo, titulo, rows[] }

const TITULOS = {
    'inventario-total':  'Inventario Total de Equipos',
    'fallas-equipo':     'Fallas de Equipo',
    'movimientos':       'Movimientos de Equipos',
    'equipos-inactivos': 'Equipos Inactivos',
    'estado-actual':     'Estado Actual de Equipos'
};

// ──────────────────────────────────────────────────────────────
// HELPERS
// ──────────────────────────────────────────────────────────────
function fmt(valor) {
    return (valor !== null && valor !== undefined && valor !== '') ? valor : '—';
}
function fmtFecha(valor) {
    if (!valor) return '—';
    try { return new Date(valor).toLocaleDateString('es-MX'); }
    catch { return String(valor); }
}

// ──────────────────────────────────────────────────────────────
// ABRIR REPORTE (fetch + vista previa)
// ──────────────────────────────────────────────────────────────
async function verReporte(tipo) {
    const titulo = TITULOS[tipo] || tipo;

    // Mostrar modal inmediatamente con estado "cargando"
    document.getElementById('modalTitulo').textContent = titulo;
    document.getElementById('preview-contenido').innerHTML =
        '<p style="text-align:center;padding:40px;color:#999;">⏳ Cargando datos del servidor...</p>';
    document.getElementById('modalReporte').classList.add('activo');

    // Limpiar filtro de fechas al abrir un reporte nuevo
    document.getElementById('fechaInicio').value = '';
    document.getElementById('fechaFin').value    = '';
    document.getElementById('contadorRegistros').textContent = '';

    try {
        const res = await fetch(`${API_REPORTES}/${tipo}`);

        if (!res.ok) {
            throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }

        const data = await res.json();

        if (!data.success) {
            document.getElementById('preview-contenido').innerHTML =
                `<p style="text-align:center;padding:30px;color:#c00;">❌ ${data.message || 'Error en el servidor'}</p>`;
            return;
        }

        if (!data.data || data.data.length === 0) {
            document.getElementById('preview-contenido').innerHTML =
                '<p style="text-align:center;padding:30px;color:#999;">📭 No hay datos disponibles para este reporte.</p>';
            return;
        }

        // Guardar datos completos del servidor
        reporteActual = { tipo, titulo, data: data.data };

        // Al inicio, los datos visibles son todos (sin filtro)
        datosVisibles = { tipo, titulo, rows: data.data };

        // Mostrar contador total
        document.getElementById('contadorRegistros').textContent = `${data.data.length} registro(s)`;

        // Renderizar tabla
        document.getElementById('preview-contenido').innerHTML = construirTabla(tipo, data.data);

    } catch (err) {
        document.getElementById('preview-contenido').innerHTML =
            `<p style="text-align:center;padding:30px;color:#c00;">❌ Error al cargar: ${err.message}</p>`;
        console.error('Error en verReporte:', err);
    }
}

// ──────────────────────────────────────────────────────────────
// FILTRO DE FECHAS
// ──────────────────────────────────────────────────────────────

/**
 * Devuelve el campo de fecha relevante de cada fila según el tipo de reporte.
 * Es la columna que se usa para comparar contra el rango Inicio–Fin.
 */
function campoFecha(tipo, row) {
    switch (tipo) {
        case 'inventario-total':  return row.Fecha_Entrada;
        case 'fallas-equipo':     return row.Fecha_falla;
        case 'movimientos':       return row.Fecha_Movimiento;
        case 'equipos-inactivos': return row.Fecha_Salida || row.Fecha_Entrada;
        case 'estado-actual':     return row.Fecha_Entrada;
        default:                  return null;
    }
}

/**
 * Filtra la tabla según las fechas ingresadas y actualiza la vista previa.
 * Si ambos inputs están vacíos, muestra todos los registros (igual que limpiar).
 */
function aplicarFiltro() {
    if (!reporteActual) {
        Swal.fire({
            icon: 'info',
            title: 'Primero carga un reporte',
            timer: 2000,
            showConfirmButton: false
        });
        return;
    }

    const valInicio = document.getElementById('fechaInicio').value;  // 'YYYY-MM-DD' o ''
    const valFin    = document.getElementById('fechaFin').value;

    // Si ambos vacíos → mostrar todo
    if (!valInicio && !valFin) {
        limpiarFiltro();
        return;
    }

    // Convertir a Date (inicio: inicio del día / fin: fin del día)
    const inicio = valInicio ? new Date(valInicio + 'T00:00:00') : null;
    const fin    = valFin    ? new Date(valFin    + 'T23:59:59') : null;

    // Validar que inicio no sea mayor que fin
    if (inicio && fin && inicio > fin) {
        Swal.fire({
            icon: 'warning',
            title: 'Rango de fechas inválido',
            text: 'La fecha de inicio debe ser anterior o igual a la fecha fin.',
            confirmButtonColor: '#6a1b31'
        });
        return;
    }

    // Filtrar filas
    const rowsFiltradas = reporteActual.data.filter(row => {
        const valorFecha = campoFecha(reporteActual.tipo, row);
        if (!valorFecha) return false;          // sin fecha → excluir

        const fecha = new Date(valorFecha);
        if (isNaN(fecha.getTime())) return false;

        if (inicio && fecha < inicio) return false;
        if (fin    && fecha > fin)    return false;
        return true;
    });

    // Actualizar datosVisibles con el resultado filtrado
    datosVisibles = {
        tipo:   reporteActual.tipo,
        titulo: reporteActual.titulo,
        rows:   rowsFiltradas
    };

    // Actualizar contador
    const counter = document.getElementById('contadorRegistros');
    counter.textContent = `${rowsFiltradas.length} de ${reporteActual.data.length} registro(s)`;
    counter.style.color = rowsFiltradas.length === 0 ? '#c00' : '#555';

    // Renderizar tabla filtrada (o mensaje vacío)
    if (rowsFiltradas.length === 0) {
        document.getElementById('preview-contenido').innerHTML =
            '<p class="msg-empty">📭 No hay registros en el rango de fechas seleccionado.</p>';
    } else {
        document.getElementById('preview-contenido').innerHTML =
            construirTabla(reporteActual.tipo, rowsFiltradas);
    }
}

/**
 * Limpia los inputs de fecha y restaura la tabla con todos los registros originales.
 */
function limpiarFiltro() {
    document.getElementById('fechaInicio').value = '';
    document.getElementById('fechaFin').value    = '';

    const counter = document.getElementById('contadorRegistros');

    if (reporteActual) {
        // Volver a mostrar todos los datos sin filtro
        datosVisibles = {
            tipo:   reporteActual.tipo,
            titulo: reporteActual.titulo,
            rows:   reporteActual.data
        };
        counter.textContent = `${reporteActual.data.length} registro(s)`;
        counter.style.color = '#555';
        document.getElementById('preview-contenido').innerHTML =
            construirTabla(reporteActual.tipo, reporteActual.data);
    } else {
        datosVisibles = null;
        counter.textContent = '';
    }
}

// ──────────────────────────────────────────────────────────────
// CONSTRUIR TABLA HTML SEGÚN TIPO
// ──────────────────────────────────────────────────────────────
function construirTabla(tipo, rows) {
    const fecha = new Date().toLocaleDateString('es-MX', { year:'numeric', month:'long', day:'numeric' });
    let cabecera = '', filas = '';

    switch (tipo) {

        case 'inventario-total':
            cabecera = `<tr>
                <th>Clave</th><th>Equipo</th><th>Tipo</th>
                <th>Ubicación</th><th>Departamento</th>
                <th>Estatus</th><th>Fecha Entrada</th><th>Componentes</th>
            </tr>`;
            filas = rows.map(r => `<tr>
                <td>${fmt(r.ClaveUnicaEquipo)}</td>
                <td>${fmt(r.Equipo)}</td>
                <td>${fmt(r.Tipo)}</td>
                <td>${fmt(r.Ubicacion)}</td>
                <td>${fmt(r.Departamento)}</td>
                <td><span class="badge badge-${fmt(r.Estatus)}">${fmt(r.Estatus)}</span></td>
                <td>${fmtFecha(r.Fecha_Entrada)}</td>
                <td>${fmt(r.Componentes)}</td>
            </tr>`).join('');
            break;

        case 'fallas-equipo':
            cabecera = `<tr>
                <th>ID</th><th>Equipo</th><th>Clave</th><th>Ubicación</th>
                <th>Fecha</th><th>Descripción</th><th>Severidad</th><th>Estatus</th>
            </tr>`;
            filas = rows.map(r => `<tr>
                <td>${fmt(r.ID_Falla)}</td>
                <td>${fmt(r.Equipo)}</td>
                <td>${fmt(r.ClaveUnicaEquipo)}</td>
                <td>${fmt(r.Ubicacion)}</td>
                <td>${fmtFecha(r.Fecha_falla)}</td>
                <td style="max-width:200px;white-space:normal;">${fmt(r.Descripcion_Falla)}</td>
                <td><span class="badge badge-${fmt(r.Severidad)}">${fmt(r.Severidad)}</span></td>
                <td><span class="badge badge-${fmt(r.Estatus_Falla).replace(' ','-')}">${fmt(r.Estatus_Falla)}</span></td>
            </tr>`).join('');
            break;

        case 'movimientos':
            cabecera = `<tr>
                <th>ID</th><th>Clave</th><th>Equipo</th>
                <th>Ubicación</th><th>Departamento</th>
                <th>Tipo Movimiento</th><th>Fecha</th><th>Motivo</th>
            </tr>`;
            filas = rows.map(r => `<tr>
                <td>${fmt(r.ID_Movimiento)}</td>
                <td>${fmt(r.ClaveUnicaEquipo)}</td>
                <td>${fmt(r.Equipo)}</td>
                <td>${fmt(r.Ubicacion)}</td>
                <td>${fmt(r.Departamento)}</td>
                <td><strong>${fmt(r.Tipo_Movimiento)}</strong></td>
                <td>${fmtFecha(r.Fecha_Movimiento)}</td>
                <td>${fmt(r.Motivo)}</td>
            </tr>`).join('');
            break;

        case 'equipos-inactivos':
            cabecera = `<tr>
                <th>Clave</th><th>Equipo</th><th>Tipo</th>
                <th>Ubicación Anterior</th><th>Departamento</th>
                <th>Fecha Entrada</th><th>Fecha Baja</th><th>Motivo Baja</th>
            </tr>`;
            filas = rows.map(r => `<tr>
                <td>${fmt(r.ClaveUnicaEquipo)}</td>
                <td>${fmt(r.Equipo)}</td>
                <td>${fmt(r.Tipo)}</td>
                <td>${fmt(r.UbicacionAnterior)}</td>
                <td>${fmt(r.Departamento)}</td>
                <td>${fmtFecha(r.Fecha_Entrada)}</td>
                <td>${fmtFecha(r.Fecha_Salida)}</td>
                <td>${fmt(r.MotivoBaja)}</td>
            </tr>`).join('');
            break;

        case 'estado-actual':
            cabecera = `<tr>
                <th>Clave</th><th>Equipo</th><th>Tipo</th>
                <th>Ubicación</th><th>Departamento</th>
                <th>Estatus</th><th>Fecha Entrada</th>
                <th style="text-align:center">Total Fallas</th>
                <th style="text-align:center">Pendientes</th>
                <th style="text-align:center">En Proceso</th>
            </tr>`;
            filas = rows.map(r => `<tr>
                <td>${fmt(r.ClaveUnicaEquipo)}</td>
                <td>${fmt(r.Equipo)}</td>
                <td>${fmt(r.Tipo)}</td>
                <td>${fmt(r.Ubicacion)}</td>
                <td>${fmt(r.Departamento)}</td>
                <td><span class="badge badge-${fmt(r.Estatus)}">${fmt(r.Estatus)}</span></td>
                <td>${fmtFecha(r.Fecha_Entrada)}</td>
                <td style="text-align:center">${r.TotalFallas ?? 0}</td>
                <td style="text-align:center">${r.FallasPendientes ?? 0}</td>
                <td style="text-align:center">${r.FallasEnProceso ?? 0}</td>
            </tr>`).join('');
            break;

        default:
            return '<p style="color:#c00;">Tipo de reporte no reconocido.</p>';
    }

    return `
        <p class="preview-titulo">${TITULOS[tipo] || tipo}</p>
        <p class="preview-meta">Instituto Tecnológico de Saltillo &nbsp;|&nbsp; ${fecha} &nbsp;|&nbsp; ${rows.length} registro(s)</p>
        <table>
            <thead>${cabecera}</thead>
            <tbody>${filas}</tbody>
        </table>`;
}

// ──────────────────────────────────────────────────────────────
// DESCARGAR PDF — usa datosVisibles (respeta el filtro activo)
// ──────────────────────────────────────────────────────────────
function descargarActual() {
    // Usar datosVisibles en lugar de reporteActual.data
    // → si hay filtro activo, descarga solo los registros filtrados
    if (!datosVisibles || datosVisibles.rows.length === 0) {
        Swal.fire({
            icon: 'info',
            title: 'No hay datos para exportar',
            text: 'Carga un reporte o ajusta el filtro de fechas.',
            timer: 2500,
            showConfirmButton: false
        });
        return;
    }

    const { tipo, titulo, rows: data } = datosVisibles;
    const { jsPDF } = window.jspdf;
    const doc   = new jsPDF('l', 'pt', 'a4');
    const ahora = new Date().toLocaleDateString('es-MX');

    // Encabezado PDF
    doc.setFontSize(17);
    doc.setTextColor(106, 27, 49);
    doc.text('SIGAS — ' + titulo, 420, 44, { align: 'center' });
    doc.setFontSize(9);
    doc.setTextColor(120);
    doc.text(`Instituto Tecnológico de Saltillo  |  ${ahora}  |  ${data.length} registros`, 420, 60, { align: 'center' });
    doc.setDrawColor(106, 27, 49);
    doc.setLineWidth(1.2);
    doc.line(40, 70, 800, 70);

    const headStyles = { fillColor: [106, 27, 49], textColor: 255, fontSize: 8 };
    const bodyStyles = { fontSize: 7.5 };

    let head = [], body = [];

    switch (tipo) {
        case 'inventario-total':
            head = [['Clave','Equipo','Tipo','Ubicación','Departamento','Estatus','F. Entrada','Componentes']];
            body = data.map(r => [
                fmt(r.ClaveUnicaEquipo), fmt(r.Equipo), fmt(r.Tipo),
                fmt(r.Ubicacion), fmt(r.Departamento), fmt(r.Estatus),
                fmtFecha(r.Fecha_Entrada), fmt(r.Componentes)
            ]);
            break;

        case 'fallas-equipo':
            head = [['ID','Equipo','Clave','Ubicación','Fecha','Descripción','Severidad','Estatus']];
            body = data.map(r => [
                fmt(r.ID_Falla), fmt(r.Equipo), fmt(r.ClaveUnicaEquipo),
                fmt(r.Ubicacion), fmtFecha(r.Fecha_falla),
                fmt(r.Descripcion_Falla), fmt(r.Severidad), fmt(r.Estatus_Falla)
            ]);
            break;

        case 'movimientos':
            head = [['ID','Clave','Equipo','Ubicación','Departamento','Tipo','Fecha','Motivo']];
            body = data.map(r => [
                fmt(r.ID_Movimiento), fmt(r.ClaveUnicaEquipo), fmt(r.Equipo),
                fmt(r.Ubicacion), fmt(r.Departamento), fmt(r.Tipo_Movimiento),
                fmtFecha(r.Fecha_Movimiento), fmt(r.Motivo)
            ]);
            break;

        case 'equipos-inactivos':
            head = [['Clave','Equipo','Tipo','Ubicación Anterior','Departamento','F. Entrada','F. Baja','Motivo']];
            body = data.map(r => [
                fmt(r.ClaveUnicaEquipo), fmt(r.Equipo), fmt(r.Tipo),
                fmt(r.UbicacionAnterior), fmt(r.Departamento),
                fmtFecha(r.Fecha_Entrada), fmtFecha(r.Fecha_Salida), fmt(r.MotivoBaja)
            ]);
            break;

        case 'estado-actual':
            head = [['Clave','Equipo','Tipo','Ubicación','Departamento','Estatus','F. Entrada','Total Fallas','Pendientes','En Proceso']];
            body = data.map(r => [
                fmt(r.ClaveUnicaEquipo), fmt(r.Equipo), fmt(r.Tipo),
                fmt(r.Ubicacion), fmt(r.Departamento), fmt(r.Estatus),
                fmtFecha(r.Fecha_Entrada),
                r.TotalFallas ?? 0, r.FallasPendientes ?? 0, r.FallasEnProceso ?? 0
            ]);
            break;

        default:
            alert('Tipo de reporte no soportado.');
            return;
    }

    doc.autoTable({
        startY: 82,
        head, body,
        theme: 'grid',
        headStyles,
        bodyStyles,
        alternateRowStyles: { fillColor: [250, 250, 250] },
        columnStyles: tipo === 'fallas-equipo' ? { 5: { cellWidth: 150 } } : {}
    });

    doc.save(`Reporte_${tipo}_SIGAS_${Date.now()}.pdf`);
    cerrarModal();
}

// ──────────────────────────────────────────────────────────────
// MODAL
// ──────────────────────────────────────────────────────────────
function cerrarModal() {
    document.getElementById('modalReporte').classList.remove('activo');
    reporteActual = null;
    datosVisibles = null;
}