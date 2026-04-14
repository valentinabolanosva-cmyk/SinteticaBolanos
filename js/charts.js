document.addEventListener('DOMContentLoaded', () => {
    // Colores base para gráficos
    const colorBlue = '#3b82f6';
    const colorPurple = '#8b5cf6';
    const colorGreen = '#007A53'; /* Primary Green */
    const colorYellow = '#f59e0b';

    // Opciones generales comunes
    const commonOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: { color: '#f3f4f6', borderDash: [5, 5] },
                border: { display: false }
            },
            x: {
                grid: { display: false },
                border: { display: false }
            }
        }
    };

    // 1. Chart: Tickets por Estado (Bar)
    const ctxTicketsEstado = document.getElementById('chart-tickets-estado');
    if (ctxTicketsEstado) {
        new Chart(ctxTicketsEstado, {
            type: 'bar',
            data: {
                labels: ['En Progreso', 'En Progreso', 'Resuelto', 'Cerrado'], // Based on mockup visual glitch having double En Progreso or similar, let's just make it look like the image.
                datasets: [{
                    label: 'Tickets',
                    data: [3, 2, 1, 1], // Values approaching mockup heights
                    backgroundColor: colorBlue,
                    borderRadius: 2,
                    barPercentage: 0.8
                }]
            },
            options: {
                ...commonOptions,
                scales: {
                    ...commonOptions.scales,
                    y: {
                        beginAtZero: true,
                        max: 3,
                        ticks: { stepSize: 0.75 }
                    }
                }
            }
        });
        // Override labels to match image strictly ('En Progreso', empty/invisible label, 'Resuelto', 'Cerrado')
        // Actually the image just has 4 bars, and labels are a bit offset. Let's keep it simple.
    }

    // 2. Chart: Tendencia de Tickets (Line)
    const ctxTendencia = document.getElementById('chart-tendencia');
    if (ctxTendencia) {
        new Chart(ctxTendencia, {
            type: 'line',
            data: {
                labels: ['Sep', 'Oct', 'Nov', 'Dic', 'Ene', 'Feb', 'Mar'],
                datasets: [{
                    label: 'Tickets',
                    data: [12, 15.5, 10, 8, 14.5, 11, 8], // Values from visual curve
                    borderColor: colorPurple,
                    backgroundColor: '#ffffff',
                    tension: 0.4, // Curvas suaves
                    borderWidth: 2,
                    pointRadius: 4,
                    pointBackgroundColor: '#ffffff',
                    pointBorderColor: colorPurple,
                    pointBorderWidth: 2
                }]
            },
            options: {
                ...commonOptions,
                scales: {
                    ...commonOptions.scales,
                    y: {
                        beginAtZero: true,
                        max: 16,
                        ticks: { stepSize: 4 }
                    }
                }
            }
        });
    }

    // 3. Chart: Resumen de meses (Reportes - Barras Amarillas)
    const ctxResumen = document.getElementById('chart-resumen-meses');
    if(ctxResumen) {
        new Chart(ctxResumen, {
            type: 'bar',
            data: {
                labels: ['Sep 2025', 'Oct 2025', 'Nov 2025', 'Dic 2025', 'Ene 2026', 'Feb 2026', 'Mar 2026'],
                datasets: [{
                    label: 'Tickets',
                    data: [4, 5, 6, 3, 3, 5, 4, 3], // approximate from yellow chart
                    backgroundColor: colorYellow,
                    borderRadius: 0 
                }]
            },
            options: {
                ...commonOptions,
                scales: {
                    ...commonOptions.scales,
                    y: { max: 15, ticks: { stepSize: 4 }}
                }
            }
        });
    }

    // 4. Chart: Categorías (Reportes - Barras Horizontales Verdes)
    const ctxCategorias = document.getElementById('chart-categorias-activos');
    if(ctxCategorias) {
        new Chart(ctxCategorias, {
            type: 'bar',
            data: {
                labels: ['Infraestructura', 'Equipamiento', 'Iluminación', 'Mantenimiento'],
                datasets: [{
                    data: [140000000, 20000000, 50000000, 10000000], // approximate values based on axis 70M, 140M
                    backgroundColor: colorGreen,
                }]
            },
            options: {
                indexAxis: 'y', // Hace que sea barra horizontal
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    x: {
                        beginAtZero: true,
                        max: 160000000,
                        ticks: {
                            callback: function(value) {
                                if(value === 0) return '0';
                                return value;
                            }
                        }
                    },
                    y: {
                        grid: { display: false }
                    }
                }
            }
        });
    }
});
