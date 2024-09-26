// Asegúrate de que PDF.js esté cargado
if (typeof pdfjsLib === 'undefined') {
    console.error('PDF.js no está cargado. Asegúrate de incluir la biblioteca correctamente.');
}

// Configura el worker de PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.9.359/pdf.worker.min.js';

document.getElementById('pdfFile').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) {
        console.error('No se seleccionó ningún archivo');
        return;
    }
    if (file.type !== 'application/pdf') {
        alert('Por favor, selecciona un archivo PDF.');
        return;
    }

    const fileReader = new FileReader();

    fileReader.onload = function() {
        const typedarray = new Uint8Array(this.result);

        pdfjsLib.getDocument(typedarray).promise.then(function(pdf) {
            console.log('PDF cargado, número de páginas:', pdf.numPages);
            const pdfImages = document.getElementById('pdfImages');
            pdfImages.innerHTML = '';

            for(let i = 1; i <= pdf.numPages; i++){
                pdf.getPage(i).then(function(page) {
                    const scale = 1.32;
                    const viewport = page.getViewport({ scale: scale });
    
                    const canvas = document.createElement('canvas');
                    const context = canvas.getContext('2d');
                    canvas.height = viewport.height;
                    canvas.width = viewport.width;
    
                    const renderContext = {
                        canvasContext: context,
                        viewport: viewport
                    };
    
                    page.render(renderContext).promise.then(function() {
                        console.log('Página ' + i + ' renderizada');
                        const img = document.createElement('img');
                        img.src = canvas.toDataURL();
                        img.style.cursor = 'crosshair';
                        
                        // Añadir evento mousemove a la imagen
                        img.addEventListener('mousemove', function(event) {
                            const rect = img.getBoundingClientRect();
                            const x = Math.round((event.clientX - rect.left) * (210 / rect.width));
                            const y = Math.round((event.clientY - rect.top) * (297 / rect.height));
                            
                            // Asegurarse de que las coordenadas estén dentro de los límites
                            const coordX = Math.min(Math.max(x, 0), 210);
                            const coordY = Math.min(Math.max(y, 0), 297);
                            
                            // Mostrar las coordenadas
                            const coordDisplay = document.createElement('div');
                            coordDisplay.textContent = `Coordenadas: (${coordX}, ${coordY})`;
                            coordDisplay.style.position = 'fixed';
                            coordDisplay.style.top = (event.clientY + 10) + 'px';
                            coordDisplay.style.left = (event.clientX + 10) + 'px';
                            coordDisplay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
                            coordDisplay.style.color = 'white';
                            coordDisplay.style.padding = '5px';
                            coordDisplay.style.borderRadius = '3px';
                            coordDisplay.style.pointerEvents = 'none';
                            coordDisplay.style.zIndex = '1000';
                            
                            // Eliminar el display anterior si existe
                            const oldDisplay = document.querySelector('.coord-display');
                            if (oldDisplay) {
                                oldDisplay.remove();
                            }
                            
                            coordDisplay.className = 'coord-display';
                            document.body.appendChild(coordDisplay);
                        });
                        
                        // Eliminar el display de coordenadas cuando el mouse sale de la imagen
                        img.addEventListener('mouseout', function() {
                            const coordDisplay = document.querySelector('.coord-display');
                            if (coordDisplay) {
                                coordDisplay.remove();
                            }
                        });
                        
                        pdfImages.appendChild(img);
                    }).catch(function(error) {
                        console.error('Error al renderizar la página:', error);
                    });
                }).catch(function(error) {
                    console.error('Error al obtener la página:', error);
                });
            }
        }).catch(function(error) {
            console.error('Error al cargar el PDF:', error);
        });
    };

    fileReader.onerror = function(error) {
        console.error('Error al leer el archivo:', error);
    };

    fileReader.readAsArrayBuffer(file);
});

console.log('Script cargado correctamente');