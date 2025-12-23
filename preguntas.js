document.addEventListener('DOMContentLoaded', () => {
    const questions = document.querySelectorAll('.faq-question');
    questions.forEach(question => {
        question.addEventListener('click', () => {
            const item = question.closest('.faq-item');
            const answer = item.querySelector('.faq-answer');
            const arrow = question.querySelector('.arrow-icon');
            
            questions.forEach(otherQuestion => {
                const otherItem = otherQuestion.closest('.faq-item');
                if (otherItem !== item && otherItem.classList.contains('active')) {
                    const otherAnswer = otherItem.querySelector('.faq-answer');
                    const otherArrow = otherQuestion.querySelector('.arrow-icon');
                    otherItem.classList.remove('active');
                    otherAnswer.style.maxHeight = null;
                    otherArrow.style.transform = 'rotate(0deg)';
                }
            });

            item.classList.toggle('active');
            if (item.classList.contains('active')) {
                answer.style.maxHeight = answer.scrollHeight + "px";
                arrow.style.transform = 'rotate(180deg)';
            } else {
                answer.style.maxHeight = null;
                arrow.style.transform = 'rotate(0deg)';
            }
        });
    });

    // =====================================================
    // CÓDIGO PARA EL BUSCADOR DE IA 
    // =====================================================
    const input = document.getElementById('ia-question-input');
    const button = document.getElementById('ia-submit-button');
    const responseBox = document.getElementById('ia-response-box');
    const responseText = document.getElementById('ia-response-text');

    /**
     * Define los temas y sus palabras clave (keywords) CRÍTICAS. 
     */
    const knowledgeBase = {
        
        // --- 1. LISTA DE ARTÍCULOS (Máxima Especificidad) ---
        // Puntuación alta por las palabras de intención ("cosas", "puedo")
        "artículos_a_empeñar": {
            keywords: ['que cosas', 'que puedo empeñar', 'que reciben', 'lista articulos', 'que aceptan', 'objetos aceptados', 'tipo de articulos', 'herramientas', 'instrumentos', 'electrodomesticos', 'bicicletas', 'relojes'],
            response: "Puedes empeñar: **Joyería** (oro, plata), **Electrónicos** (celulares, laptops, consolas, TVs), **Herramientas** de marca, **Instrumentos Musicales**, **Electrodomésticos** pequeños, **Bicicletas** y **Automóviles**. Todo depende del estado físico y funcionamiento."
        },

        // --- 2. CONCEPTO FUNDAMENTAL ---
        // Puntuación media. Debería ganar solo si la pregunta no es sobre la lista.
        "empeño": {
            keywords: ['que es un empeño', 'como funciona', 'prestamo prendario', 'definicion empeño', 'concepto empeño', 'quiero empeñar', 'proceso'],
            response: "Un **Empeño** es un préstamo inmediato dejando una garantía. 1. Traes tu artículo. 2. Lo valuamos. 3. Te decimos cuánto te prestamos. 4. Firmas contrato y recibes tu dinero al instante. Sin aval ni Buró de Crédito."
        },
        
        // --- 3. REFRENDO (Soluciona Falla de Imagen 2) ---
        // Esta palabra clave específica DEBE ganar la puntuación cuando está presente.
        "refrendo": {
            keywords: ['refrendo', 'renovar contrato', 'prorroga', 'extender plazo', 'refrendar', 'pagar refrendo', 'costo refrendo', 'pagar interes', 'mas tiempo'],
            response: "El **Refrendo** te da más tiempo. Pagando solo los intereses de tu contrato, extiendes el plazo por otros 30 días. Puedes refrendar las veces que necesites para no perder tu prenda."
        },
        
        // --- 4. Resto de Conceptos Financieros y Legales ---
        "avaluo": {
            keywords: ['avaluacion', 'avaluo', 'cuanto me dan', 'cuanto prestan', 'valor de mi', 'cotizar', 'cotizacion', 'precio oro', 'cuanto vale'],
            response: "La **Valuación** es gratuita. Nuestros expertos revisan tu artículo (estado, modelo, marca, metal) y te ofrecen un préstamo basado en su valor comercial actual. ¡Tráelo para una cotización exacta!"
        },
        "desempeño": {
            keywords: ['desempeño', 'desempeno', 'liquidar', 'recuperar', 'pago total', 'retirar articulo'],
            response: "El **Desempeño** es la liquidación total de tu contrato. Significa pagar el capital original más los intereses y cargos acumulados hasta el día de tu pago para recuperar tu prenda."
        },
        "capital": {
            keywords: ['principal', 'capital', 'abono', 'monto original'],
            response: "El **Capital (o Principal)** es el monto de dinero original que te prestamos. Los **abonos a capital** son pagos directos que reducen este monto, disminuyendo los intereses que pagarás en el siguiente periodo."
        },
        "demasia": {
            keywords: ['demasia', 'excedente', 'saldo a favor', 'dinero sobrante'],
            response: "La **Demasía** es el dinero excedente de la venta de tu prenda, después de cubrir la deuda y los gastos de venta. Si se genera, tienes derecho a reclamarla y se te notificará en un plazo de 90 días después de la venta."
        },
        "comercializacion": {
            keywords: ['comercializacion', 'remate', 'no pago', 'venta de prenda', 'pasa si no pago'],
            response: "La **Comercialización** (venta) es el proceso de disponer de tu prenda si no fue liquidada ni refrendada en el plazo y periodo de gracia. Esto se hace para recuperar el monto prestado y generar una posible demasía (excedente) para ti."
        },
        "dias_gracia": {
            keywords: ['gracia', 'vencimiento', 'se me paso la fecha', 'dias extra', 'limite'],
            response: "Los **Días de Gracia** son un periodo adicional (generalmente 5 a 10 días, según el contrato) posteriores a la fecha de vencimiento, durante el cual aún puedes refrendar o desempeñar tu artículo, pagando un pequeño recargo o interés extra."
        },
        "prenda": {
            keywords: ['prenda', 'garantia', 'articulo dejado', 'custodia'],
            response: "La **Prenda** es el bien de valor que dejas como garantía física. Una vez que realizas el desempeño (liquidación total), la prenda te es devuelta en el mismo estado en que la dejaste."
        },
        "boleta": {
            keywords: ['boleta', 'contrato', 'terminos', 'ticket', 'perdi la boleta', 'extravio boleta', 'perdi mi contrato'],
            response: "La **Boleta** es tu comprobante. Si la perdiste, ¡no te preocupes! Acude a la sucursal con tu identificación oficial (INE) para tramitar una reposición o realizar tus pagos. Es vital que seas el titular."
        },
        "cat": {
            keywords: ['cat', 'costo anual total', 'tasa real', 'interes'],
            response: "El **Costo Anual Total (CAT)** es un indicador estandarizado que incluye la tasa de interés nominal más todos los costos y comisiones inherentes al préstamo (seguro, almacenaje, apertura), para que compares opciones de financiamiento."
        },

        // --- 5. Autoempeño y Vehículos ---
        "autoempeño": {
            keywords: ['auto', 'coche', 'vehiculo', 'camioneta', 'requisitos auto', 'dejar coche', 'empeñar auto', 'empenar coche', 'mi auto', 'mi carro', 'papeles auto', 'factura'],
            response: "Para **Auto Empeño Luna**: Factura original, tarjeta de circulación vigente, pagos al corriente (tenencia/verificación), duplicado de llaves e INE. El auto debe ser modelo 2013 en adelante (aprox)."
        },
        "uso_coche": {
            keywords: ['uso el coche', 'manejar mi auto', 'sin resguardo', 'gps', 'me lo quedo', 'seguir manejando'],
            response: "Tenemos la opción de **'Auto Empeño Luna sin Resguardo'** (Sigue Usándolo). El vehículo debe ser de modelo reciente, pasar una revisión más estricta, y se requiere instalar un GPS de monitoreo."
        },
        "moto": {
            keywords: ['moto', 'motocicleta', 'cuatrimoto'],
            response: "Aceptamos motocicletas recientes, en excelente estado. Requisitos: factura original, tarjeta de circulación e identificación. El modelo debe ser de agencia y no armado."
        },
        "factura_auto": {
            keywords: ['carta factura', 'financiamiento', 'liberacion', 'refacturado', 'aseguradora'],
            response: "Aceptamos vehículos con **Carta Factura** siempre que esté acompañada de la copia de la factura de origen y que el crédito esté liquidado al 100%. También aceptamos Refacturación de Aseguradora o Empresa, siempre que se acredite la legalidad."
        },
        
        // --- 6. Joyería y Electrónicos ---
        "joyeria": {
            keywords: ['joya', 'oro', 'plata', 'kilataje', 'diamante', 'espectrometro', 'empeñar oro', 'empenar joyas', 'anillo', 'collar', 'cadena', 'esclava', 'centenario', '14k', '10k', 'pedaceria', 'aretes', 'dije'],
            response: "Somos expertos en **Joyería**. Aceptamos oro de cualquier kilataje (incluso pedacería), plata y diamantes. Usamos tecnología de Rayos X para darte el pago más justo por la pureza real de tu pieza."
        },
        "electronicos": {
            keywords: ['electronico', 'celular', 'tablet', 'laptop', 'macbook', 'ipad', 'imei', 'falla electronico', 'pantalla rota', 'empeñar celular', 'empenar laptop', 'iphone', 'samsung', 'xbox', 'playstation', 'nintendo', 'consola', 'smart tv', 'pantalla', 'bocina', 'camara'],
            response: "En **Electrónicos** aceptamos: Celulares, Laptops, Tablets, Consolas, Pantallas (Smart TV), Cámaras y Equipos de Sonido. Deben funcionar correctamente y tener sus accesorios básicos (cargador)."
        },
        
        // --- 7. General ---
        "seguridad": {
            keywords: ['seguridad', 'cuidado', 'robo', 'boveda', 'poliza', 'dano a mi articulo'],
            response: "Tu prenda está 100% segura. Todas las prendas se almacenan en **bóvedas de alta seguridad**, monitoreadas 24/7 y cuentan con una **póliza de seguro** contra robo e incendio."
        },
        "documentos": {
            keywords: ['identificacion', 'ine', 'pasaporte', 'licencia', 'comprobante de domicilio', 'carta poder', 'tercero', 'quien puede hacer el tramite'],
            response: "Requerimos identificación oficial vigente del titular (INE, Pasaporte). Para trámites por un tercero, es indispensable una Carta Poder Simple."
        },
        "regulacion": {
            keywords: ['profeco', 'regulacion', 'legal', 'queja', 'derechos', 'contrato registrado'],
            response: "Estamos regulados y operamos bajo las normativas de la ley mexicana y las disposiciones de la **PROFECO**. Para quejas, llama a la línea de Servicio al Cliente **664 589 7356**."
        },
        "intereses": {
            keywords: ['interes', 'tasa', 'cobran', 'porcentaje', 'cuanto pago', 'comision', 'mensualidad'],
            response: "Nuestra tasa de interés es competitiva y se ajusta al mercado. El costo total depende del monto prestado y el plazo elegido. En tu valoración te explicaremos exactamente cuánto pagarás antes de firmar."
        },
        "contacto_horario": {
            keywords: ['horario', 'sucursal', 'donde estan', 'ubicacion', 'telefono', 'whatsapp', 'contacto', 'direccion', 'abierto', 'cerrado'],
            response: "Nuestro horario es de Lunes a Domingo de 9:00 a.m. a 8:30 p.m. Puedes ver el mapa en la sección de **Contacto** o llamar al **664 589 7356** para ubicar tu sucursal más cercana."
        },

        // --- 8. Interacción Social (NUEVO) ---
        "saludos": {
            keywords: ['hola', 'buenos dias', 'buenas tardes', 'buenas noches', 'que tal', 'hi', 'hello', 'oiga', 'disculpe'],
            response: "¡Hola! 👋 Soy tu asistente virtual inteligente. Estoy aquí para resolver tus dudas sobre **préstamos**, **refrendos** y **artículos** que aceptamos. ¿En qué puedo ayudarte hoy?"
        },
        "agradecimiento": {
            keywords: ['gracias', 'muchas gracias', 'te agradezco', 'ok gracias', 'vale gracias', 'muy amable'],
            response: "¡De nada! Es un placer ayudarte. 😊 Recuerda que en **Empeños** estamos para servirte. Si tienes otra duda, aquí sigo."
        },
        "despedida": {
            keywords: ['adios', 'bye', 'hasta luego', 'nos vemos', 'ya me voy'],
            response: "¡Hasta luego! Que tengas un excelente día. Recuerda que tu tranquilidad financiera es nuestra prioridad."
        }
    };

    /**
     * Función principal para buscar la respuesta usando PUNTUACIÓN (SCORING)
     * @param {string} question - La pregunta del usuario.
     * @returns {string} - La respuesta de la IA o el mensaje de fallback.
     */
    function getIaResponse(question) {
        // 1. Normalización avanzada: minúsculas, sin acentos, sin puntuación extraña
        const cleanQuestion = question.toLowerCase()
                                      .normalize("NFD")
                                      .replace(/[\u0300-\u036f]/g, "")
                                      .replace(/[^\w\s]/g, " "); // Reemplazar signos por espacios
        
        // Tokenizamos la pregunta para búsquedas de palabras exactas
        const questionWords = cleanQuestion.split(/\s+/);
        
        let bestMatchTopic = null;
        let maxScore = 0;

        // Itera sobre toda la base de conocimiento para asignar puntuación
        for (const topicKey in knowledgeBase) {
            const topic = knowledgeBase[topicKey];
            let currentScore = 0;

            // Comprueba cuántas palabras clave del tema están presentes en la pregunta
            topic.keywords.forEach(keyword => {
                const cleanKeyword = keyword.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                
                // Lógica mejorada: Frases valen MUCHO más (10 pts) para asegurar prioridad
                if (cleanKeyword.includes(" ") && cleanQuestion.includes(cleanKeyword)) {
                    currentScore += 10; 
                } else if (questionWords.includes(cleanKeyword)) {
                    currentScore += 1;
                }
            });

            // Si la puntuación actual es mayor que la máxima encontrada, actualiza
            if (currentScore > maxScore) {
                maxScore = currentScore;
                bestMatchTopic = topicKey;
            }
        }
        
        // Regla de Desempate/Umbral: Si la puntuación máxima es al menos 1, devuelve la respuesta.
        if (maxScore > 0) {
            return knowledgeBase[bestMatchTopic].response;
        }

        // --- Respuesta Genérica/Fallback Final ---
        return "Lo siento, esa es una pregunta muy específica. Nuestra IA está súper-entrenada, pero si no encontraste tu respuesta, significa que es una consulta que requiere la atención inmediata de un asesor. Por favor, llama a la línea de contacto **664 589 7356**. ¡Gracias por tu comprensión!";
    }

    function handleIaSearch() {
        const question = input.value.trim();
        
        if (question.length === 0) {
            responseText.textContent = "Por favor, escribe tu pregunta antes de buscar.";
            responseBox.style.display = 'block';
            return;
        }

        // Simular un tiempo de "pensamiento" de la IA y deshabilitar botón
        responseBox.style.display = 'block';
        responseText.innerHTML = "🤖 Buscando la mejor respuesta para ti...";
        button.disabled = true;

        setTimeout(() => {
            const answer = getIaResponse(question);
            
            // --- FORMATEO DE TEXTO (Estilo) ---
            // Convierte **texto** en HTML con clase para estilo
            let formattedAnswer = answer.replace(/\*\*(.*?)\*\*/g, '<span class="ia-highlight">$1</span>');
            
            responseText.innerHTML = formattedAnswer;
            button.disabled = false;
        }, 1500); // Espera de 1.5 segundos
    }

    // Eventos para el botón y la tecla Enter
    button.addEventListener('click', handleIaSearch);
    input.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            handleIaSearch();
        }
    });
});