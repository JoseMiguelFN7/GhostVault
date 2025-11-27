// Confirma en la consola que el archivo se ha cargado correctamente.
// EN: Confirms in the console that the file has loaded correctly.
console.log("Messages.js loaded");

// Definimos el ID del contenedor HTML en una constante para evitar errores de escritura.
// EN: Defines the HTML container ID in a constant to prevent typos later on.
const containerId = 'messages-container';

/**
 * Función: rendering
 * Objetivo: Recibe una lista de datos y crea los elementos visuales en el HTML.
 * EN: Function: rendering
 * EN: Goal: Receives a list of data and creates the visual elements in the HTML.
 */
function rendering(listaDeComentarios) {
    // Buscamos el elemento en el HTML donde pondremos los mensajes.
    // EN: We look for the HTML element where we will place the messages.
    const container = document.getElementById(containerId);
    
    // Verificación de seguridad: Si el contenedor no existe, detenemos la función.
    // EN: Safety check: If the container does not exist, we stop the function.
    if (!container) {
        console.error(`Contenedor no encontrado.`);
        return;
    }
    
    // LIMPIEZA: Borramos el contenido anterior para evitar que se dupliquen los mensajes.
    // EN: CLEANUP: We erase the previous content to prevent messages from being duplicated.
    container.innerHTML = ''; 

    // BUCLE: Recorremos el array (lista) de comentarios uno por uno.
    // EN: LOOP: We iterate over the comments array (list) one by one.
    listaDeComentarios.forEach(comment => {
        
        // Creamos dinámicamente un elemento <div> y un elemento <p> en la memoria.
        // EN: Dynamically create a <div> element and a <p> element in memory.
        const messageElement = document.createElement('div');
        const bodyText = document.createElement('p');

        // Asignamos el texto del comentario (que viene del JSON) al párrafo.
        // EN: We assign the comment text (from the JSON) to the paragraph.
        bodyText.textContent = comment.body;
        
        // Asignamos las clases de estilo (Tailwind CSS) al párrafo.
        // EN: We assign the style classes (Tailwind CSS) to the paragraph.
        bodyText.className = 'text-xl p-2 text-violet-200 border border-violet-500 inline-block rounded-2xl mb-4 bg-violet-900/50';
        
        // Construcción del DOM: Metemos el párrafo dentro del div.
        // EN: DOM Construction: We place the paragraph inside the div.
        messageElement.appendChild(bodyText);
        
        // Insertamos el mensaje completo dentro del contenedor principal.
        // EN: Insert the complete message inside the main container.
        container.appendChild(messageElement);
        
    });
}

/**
 * Función: loadingJSON
 * Objetivo: Conectarse a internet, descargar los datos y prepararlos. Es 'async'.
 * EN: Function: loadingJSON
 * EN: Goal: Connect to the internet, download data, and prepare it. It is 'async'.
 */
async function loadingJSON() {
    // Usamos try/catch para manejar errores de red de forma segura.
    // EN: We use try/catch to safely handle network errors.
    try {
        // Hacemos la petición a la URL. 'await' espera la respuesta del servidor.
        // EN: We make the request to the URL. 'await' waits for the server response.
        const response = await fetch('https://jsonplaceholder.typicode.com/comments');
        
        // Verificamos si la respuesta fue exitosa (código 200-299).
        // EN: We verify if the response was successful (status 200-299).
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        // Convertimos la respuesta en un array de objetos JavaScript (JSON).
        // EN: We convert the response into an array of JavaScript objects (JSON).
        const commentsData = await response.json();
        
        // Mostramos todos los datos descargados en consola para revisarlos.
        // EN: We show all downloaded data in the console for review.
        console.log(commentsData);

        // FILTRO: Tomamos solo los primeros 10 elementos para la demostración.
        // EN: FILTER: We take only the first 10 elements for the demonstration.
        const primeros10 = commentsData.slice(0, 10);

        // Llamamos a la función de renderizado con la lista filtrada.
        // EN: We call the rendering function with the filtered list.
        rendering(primeros10);
        
    } catch (error) {
        // Capturamos cualquier error ocurrido durante la carga o procesamiento.
        // EN: We catch any error that occurred during loading or processing.
        console.error('Hubo un problema al cargar los comentarios:', error);
    }
}

// Ejecutamos la función principal para que todo arranque.
// EN: We execute the main function to start the entire process.
loadingJSON();