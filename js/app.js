// ------------------------------
// Configuración y variables
// ------------------------------
let currentTheme = 'light';
let colorFormats = {}; // Para almacenar el formato preferido de cada color
let colorAlpha = {}; // Para almacenar el valor alpha de cada color
let isInitializing = false;
let actionHistory = [];
let currentEditData = null;
let currentEditFormat = 'hex';

// Colores iniciales
const initialColors = [
	'#FF5252',  // Rojo
	'#4CAF50',  // Verde
	'#2196F3',  // Azul
	'#FFC107',  // Amarillo
	'#9C27B0'   // Púrpura
];

// ------------------------------
// Inicialización
// ------------------------------
document.addEventListener('DOMContentLoaded', () => {
	initTheme();
	initColorInputs();
	initEventListeners();
	updateCombinations();
	
	// Intentar cargar desde URL o localStorage
	loadStateFromUrlOrStorage();
});

function initTheme() {
	// Configurar colores de tema
	document.getElementById('light-bg-color').value = getComputedStyle(document.documentElement).getPropertyValue('--light-bg-color').trim();
	document.getElementById('dark-bg-color').value = getComputedStyle(document.documentElement).getPropertyValue('--dark-bg-color').trim();
	
	// Verificar preferencia de tema guardada
	const savedTheme = localStorage.getItem('colorCombinator.theme');
	if (savedTheme) {
		setTheme(savedTheme);
	} else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
		// Si el sistema prefiere oscuro
		setTheme('dark');
	}
}

function initColorInputs() {
	const colorInputsContainer = document.getElementById('color-inputs');
	colorInputsContainer.innerHTML = '';
	
	// Marcar que estamos en fase de inicialización
	isInitializing = true;
	
	// Cargar colores guardados o usar los iniciales
	const savedColors = localStorage.getItem('colorCombinator.colors');
	let colors = [];
	
	if (savedColors) {
		try {
			colors = JSON.parse(savedColors);
		} catch (e) {
			console.error('Error parsing saved colors:', e);
			colors = initialColors;
		}
	} else {
		colors = initialColors;
	}
	
	// Crear inputs de color
	colors.forEach(color => {
		if (typeof color === 'object' && color.color) {
			// Formato nuevo (objeto con color y alpha)
			addColorInput(color.color, color.alpha || 0);
		} else {
			// Formato antiguo (solo string de color)
			addColorInput(color, 0);
		}
	});
	
	// Finalizar inicialización
	isInitializing = false;
}

function initEventListeners() {
	// Eventos de tema
	document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
	document.getElementById('light-bg-color').addEventListener('input', updateThemeColors);
	document.getElementById('dark-bg-color').addEventListener('input', updateThemeColors);
	
	// Eventos de contenido
	document.getElementById('text-input').addEventListener('input', updateCombinations);
	
	// Eventos de paleta
	document.getElementById('add-color').addEventListener('click', () => addColorInput());
	
	// Eventos de importación/exportación
	document.getElementById('import-coolors').addEventListener('click', importCoolors);
	document.getElementById('export-coolors').addEventListener('click', exportCoolors);
	document.getElementById('export-clipboard').addEventListener('click', copyPaletteToClipboard);
	
	// Evento de deshacer
	document.getElementById('undo-button').addEventListener('click', undoLastAction);
	
	// Eventos móviles
	document.getElementById('mobile-menu-toggle').addEventListener('click', toggleMobileMenu);
	document.getElementById('sidebar-overlay').addEventListener('click', closeMobileMenu);
	
	// Eventos del modal de edición de color
	try {
		document.querySelector('.color-edit-close').addEventListener('click', closeColorEditModal);
		document.getElementById('color-edit-picker').addEventListener('input', updateColorEditPreview);
		document.getElementById('color-edit-transparency').addEventListener('input', updateColorEditPreview);
		document.getElementById('color-edit-save').addEventListener('click', saveColorEdit);
		document.getElementById('color-edit-add').addEventListener('click', addColorFromEdit);
		document.getElementById('color-edit-cancel').addEventListener('click', closeColorEditModal);
		
		// Botones de formato en el modal
		document.querySelectorAll('#color-edit-modal .format-button').forEach(button => {
			button.addEventListener('click', (e) => {
				// Actualizar botones activos
				document.querySelectorAll('#color-edit-modal .format-button').forEach(btn => {
					btn.classList.remove('active');
				});
				e.target.classList.add('active');
				
				// Actualizar formato y previsualización
				currentEditFormat = e.target.dataset.format;
				updateColorEditPreview();
			});
		});
	} catch (e) {
		console.error('Error setting up color edit modal events:', e);
	}
	
	// Validar URL de Coolors
	document.getElementById('coolors-url').addEventListener('input', validateCoolorsUrl);
	
	// Guardar estado cuando cambia
	window.addEventListener('beforeunload', saveStateToStorage);
	
	// Cerrar lightbox al hacer clic fuera de la tarjeta
	document.getElementById('lightbox-overlay').addEventListener('click', closeLightbox);
}

// ------------------------------
// Gestión de colores
// ------------------------------
function addColorInput(colorValue = null, alpha = 0) {
	// Guardar estado actual para deshacer (solo si no estamos en inicialización)
	if (!isInitializing) {
		saveActionToHistory('add_color');
	}
	
	// Generar color aleatorio si no se proporciona uno
	if (!colorValue) {
		colorValue = generateRandomColor();
	}
	
	// Asegurar que el color esté en formato hexadecimal
	if (!colorValue.startsWith('#')) {
		colorValue = '#' + colorValue;
	}
	
	const colorInputsContainer = document.getElementById('color-inputs');
	const colorId = `color-${Date.now()}`;
	
	// Crear elemento de color
	const colorInputElement = document.createElement('div');
	colorInputElement.className = 'color-input';
	colorInputElement.dataset.colorId = colorId;
	
	// Establecer formato predeterminado para este color
	colorFormats[colorId] = 'hex';
	colorAlpha[colorId] = alpha;
	
	colorInputElement.innerHTML = `
		<div class="color-picker-container">
			<input type="color" value="${colorValue}" data-color-id="${colorId}">
		</div>
		<div class="color-details">
			<div class="color-value">
				<input type="text" value="${colorValue.toUpperCase()}" readonly>
				<button class="copy-button" title="Copiar valor">
					<span class="material-symbols-outlined">content_copy</span>
				</button>
			</div>
			<div class="color-format-options">
				<div class="color-format-row">
					<button class="format-button active" data-format="hex" data-color-id="${colorId}">HEX</button>
					<button class="format-button" data-format="rgb" data-color-id="${colorId}">RGB</button>
					<button class="format-button" data-format="hsl" data-color-id="${colorId}">HSL</button>
				</div>
			</div>
		</div>
		<div class="color-actions">
			<button class="icon-only copy-color" title="Copiar color">
				<span class="material-symbols-outlined">content_copy</span>
			</button>
			<button class="icon-only remove-color" title="Eliminar color">
				<span class="material-symbols-outlined">delete</span>
			</button>
		</div>
	`;
	
	colorInputsContainer.appendChild(colorInputElement);
	
	const colorPicker = colorInputElement.querySelector('input[type="color"]');
	colorPicker.addEventListener('input', handleColorChange);
	
	const copyButton = colorInputElement.querySelector('.copy-button');
	copyButton.addEventListener('click', copyColorValue);
	
	const copyColorButton = colorInputElement.querySelector('.copy-color');
	copyColorButton.addEventListener('click', copyColorValue);
	
	const removeButton = colorInputElement.querySelector('.remove-color');
	removeButton.addEventListener('click', removeColor);
	
	const formatButtons = colorInputElement.querySelectorAll('.format-button');
	formatButtons.forEach(button => {
		button.addEventListener('click', changeColorFormat);
	});
	
	// Actualizar combinaciones
	updateCombinations();
	
	// Animación sutil de entrada
	colorInputElement.style.opacity = '0';
	colorInputElement.style.transform = 'translateY(10px)';
	setTimeout(() => {
		colorInputElement.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
		colorInputElement.style.opacity = '1';
		colorInputElement.style.transform = 'translateY(0)';
	}, 10);
	
	return colorInputElement;
}

function handleColorChange(event) {
	// Guardar estado actual para deshacer
	saveActionToHistory('color_change');
	
	const colorId = event.target.dataset.colorId;
	const colorValue = event.target.value;
	const colorInput = document.querySelector(`.color-input[data-color-id="${colorId}"]`);
	const textInput = colorInput.querySelector('input[type="text"]');
	
	// Actualizar valor según el formato seleccionado
	const format = colorFormats[colorId];
	textInput.value = formatColor(colorValue, format);
	
	// Actualizar combinaciones
	updateCombinations();
}

function changeColorFormat(event) {
	const button = event.target.closest('.format-button');
	const colorId = button.dataset.colorId;
	const format = button.dataset.format;
	const colorInput = document.querySelector(`.color-input[data-color-id="${colorId}"]`);
	const colorPicker = colorInput.querySelector('input[type="color"]');
	const textInput = colorInput.querySelector('input[type="text"]');
	
	// Actualizar estado activo de los botones
	const formatButtons = colorInput.querySelectorAll('.format-button');
	formatButtons.forEach(btn => btn.classList.remove('active'));
	button.classList.add('active');
	
	// Actualizar formato guardado
	colorFormats[colorId] = format;
	
	// Actualizar valor mostrado
	textInput.value = formatColor(colorPicker.value, format);
}

function formatColor(hexColor, format, alpha = 0) {
	// Extraer valores RGB
	const r = parseInt(hexColor.slice(1, 3), 16);
	const g = parseInt(hexColor.slice(3, 5), 16);
	const b = parseInt(hexColor.slice(5, 7), 16);
	
	switch (format) {
		case 'hex':
			return hexColor.toUpperCase();
		case 'rgb':
			return `rgb(${r}, ${g}, ${b})`;
		case 'rgba':
			return `rgba(${r}, ${g}, ${b}, ${(100 - alpha) / 100})`;
		case 'hsl': {
			const hsl = rgbToHsl(r, g, b);
			return `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
		}
		case 'hsla': {
			const hsl = rgbToHsl(r, g, b);
			return `hsla(${hsl.h}, ${hsl.s}%, ${hsl.l}%, ${(100 - alpha) / 100})`;
		}
		case 'hexa':
			const alphaHex = Math.round((100 - alpha) * 255 / 100).toString(16).padStart(2, '0');
			return `${hexColor.toUpperCase()}${alphaHex}`;
		default:
			return hexColor.toUpperCase();
	}
}

function rgbToHsl(r, g, b) {
	r /= 255;
	g /= 255;
	b /= 255;
	
	const max = Math.max(r, g, b);
	const min = Math.min(r, g, b);
	let h, s, l = (max + min) / 2;
	
	if (max === min) {
		h = s = 0; // achromatic
	} else {
		const d = max - min;
		s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
		
		switch (max) {
			case r: h = (g - b) / d + (g < b ? 6 : 0); break;
			case g: h = (b - r) / d + 2; break;
			case b: h = (r - g) / d + 4; break;
		}
		
		h /= 6;
	}
	
	return {
		h: Math.round(h * 360),
		s: Math.round(s * 100),
		l: Math.round(l * 100)
	};
}

function copyColorValue(event) {
	const button = event.currentTarget;
	const colorInput = button.closest('.color-input');
	const textInput = colorInput.querySelector('input[type="text"]');
	
	// Copiar al portapapeles
	navigator.clipboard.writeText(textInput.value).then(() => {
		showNotification('Copiado al portapapeles', `Valor ${textInput.value} copiado`, 'success');
	}).catch(err => {
		showNotification('Error al copiar', 'No se pudo copiar el valor', 'error');
	});
}

function removeColor(event) {
	const colorInputsContainer = document.getElementById('color-inputs');
	const colorInput = event.currentTarget.closest('.color-input');
	
	// Verificar que tengamos al menos dos colores
	if (colorInputsContainer.children.length <= 2) {
		showNotification('No se puede eliminar', 'Debes tener al menos dos colores', 'error');
		return;
	}
	
	// Guardar estado actual para deshacer
	saveActionToHistory('remove_color');
	
	// Animar salida
	colorInput.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
	colorInput.style.opacity = '0';
	colorInput.style.transform = 'translateY(10px)';
	
	// Eliminar después de la animación
	setTimeout(() => {
		colorInputsContainer.removeChild(colorInput);
		updateCombinations();
	}, 300);
}

function generateRandomColor() {
	// Generar color aleatorio con buena saturación y luminosidad
	const h = Math.floor(Math.random() * 360);
	const s = Math.floor(Math.random() * 30) + 70; // 70-100% saturación
	const l = Math.floor(Math.random() * 30) + 35; // 35-65% luminosidad
	
	// Convertir HSL a RGB
	const c = (1 - Math.abs(2 * l / 100 - 1)) * s / 100;
	const x = c * (1 - Math.abs((h / 60) % 2 - 1));
	const m = l / 100 - c / 2;
	
	let r, g, b;
	
	if (h < 60) {
		r = c; g = x; b = 0;
	} else if (h < 120) {
		r = x; g = c; b = 0;
	} else if (h < 180) {
		r = 0; g = c; b = x;
	} else if (h < 240) {
		r = 0; g = x; b = c;
	} else if (h < 300) {
		r = x; g = 0; b = c;
	} else {
		r = c; g = 0; b = x;
	}
	
	r = Math.round((r + m) * 255);
	g = Math.round((g + m) * 255);
	b = Math.round((b + m) * 255);
	
	return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
}

// ------------------------------
// Combinaciones de colores
// ------------------------------
function updateCombinations() {
	const colors = getColorsFromInputs();
	const htmlContent = document.getElementById('text-input').value || 'Lorem ipsum';
	const container = document.getElementById('combinations-container');
	
	// Limpiar contenedor
	container.innerHTML = '';
	
	// Crear combinaciones
	for (let i = 0; i < colors.length; i++) {
		for (let j = 0; j < colors.length; j++) {
			if (i !== j) {
				const bgColor = colors[i].color;
				const textColor = colors[j].color;
				const bgColorId = colors[i].id;
				const textColorId = colors[j].id;
				
				createCombinationCard(bgColor, textColor, htmlContent, container, bgColorId, textColorId);
			}
		}
	}
}

function createCombinationCard(bgColor, textColor, htmlContent, container, bgColorId, textColorId) {
	const combinationId = `combination-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
	const combination = document.createElement('div');
	combination.className = 'combination';
	combination.id = combinationId;
	combination.dataset.bgColorId = bgColorId;
	combination.dataset.textColorId = textColorId;
	combination.style.backgroundColor = bgColor;
	
	// Área de texto
	const textElement = document.createElement('div');
	textElement.className = 'combination-text';
	textElement.style.color = textColor;
	textElement.innerHTML = htmlContent;
	combination.appendChild(textElement);
	
	// Calcular contraste
	const contrastRatio = calculateContrastRatio(bgColor, textColor);
	const isAALarge = contrastRatio >= 3.0;
	const isAANormal = contrastRatio >= 4.5;
	const isAAALarge = contrastRatio >= 4.5;
	const isAAANormal = contrastRatio >= 7.0;
	
	// Crear área de información
	const infoElement = document.createElement('div');
	infoElement.className = 'combination-info';
	
	// Fila 1: Colores
	const colorRow = document.createElement('div');
	colorRow.className = 'combination-info-row';
	
	// Obtener formato de los colores seleccionados
	const bgColorFormat = colorFormats[bgColorId] || 'hex';
	const textColorFormat = colorFormats[textColorId] || 'hex';
	const bgAlpha = colorAlpha[bgColorId] || 0;
	const textAlpha = colorAlpha[textColorId] || 0;
	
	// Formatear valores
	const bgColorFormatted = formatColor(bgColor, bgColorFormat, bgAlpha);
	const textColorFormatted = formatColor(textColor, textColorFormat, textAlpha);
	
	const bgColorInfo = document.createElement('span');
	bgColorInfo.className = 'bg-color-info';
	bgColorInfo.innerHTML = `<span class="color-swatch" style="background-color: ${bgColor}" data-color-id="${bgColorId}"></span> ${bgColorFormatted}`;
	bgColorInfo.title = "Editar color de fondo";
	bgColorInfo.style.cursor = "pointer";
	bgColorInfo.addEventListener('click', () => openColorEditModal('background', combinationId, bgColor, bgColorId));
	
	const textColorInfo = document.createElement('span');
	textColorInfo.className = 'text-color-info';
	textColorInfo.innerHTML = `<span class="color-swatch" style="background-color: ${textColor}" data-color-id="${textColorId}"></span> ${textColorFormatted}`;
	textColorInfo.title = "Editar color de texto";
	textColorInfo.style.cursor = "pointer";
	textColorInfo.addEventListener('click', () => openColorEditModal('text', combinationId, textColor, textColorId));
	
	colorRow.appendChild(bgColorInfo);
	colorRow.appendChild(textColorInfo);
	
	// Fila 2: Contraste y WCAG
	const contrastRow = document.createElement('div');
	contrastRow.className = 'combination-info-row';
	
	const contrastInfo = document.createElement('span');
	contrastInfo.textContent = `Contraste: ${contrastRatio.toFixed(2)}:1`;
	
	const wcagBadges = document.createElement('div');
	wcagBadges.className = 'wcag-badges';
	
	const aaBadge = document.createElement('span');
	aaBadge.className = `wcag-badge ${isAANormal ? 'wcag-pass' : 'wcag-fail'}`;
	aaBadge.title = 'WCAG AA para texto normal (≥4.5:1)';
	aaBadge.textContent = 'AA';
	
	const aaaBadge = document.createElement('span');
	aaaBadge.className = `wcag-badge ${isAAANormal ? 'wcag-pass' : 'wcag-fail'}`;
	aaaBadge.title = 'WCAG AAA para texto normal (≥7:1)';
	aaaBadge.textContent = 'AAA';
	
	wcagBadges.appendChild(aaBadge);
	wcagBadges.appendChild(aaaBadge);
	
	// Botón de corrección si no cumple AA
	if (!isAANormal) {
		const fixButton = document.createElement('button');
		fixButton.className = 'fix-wcag-btn';
		fixButton.innerHTML = `<span class="material-symbols-outlined">auto_fix</span>`;
		fixButton.title = 'Corregir contraste';
		fixButton.addEventListener('click', () => openCorrectionPanel(combinationId, bgColor, textColor, bgColorId, textColorId));
		wcagBadges.appendChild(fixButton);
	}
	
	// Botón de lightbox
	const lightboxButton = document.createElement('button');
	lightboxButton.className = 'fix-wcag-btn';
	lightboxButton.innerHTML = `<span class="material-symbols-outlined">visibility</span>`;
	lightboxButton.title = 'Ver en modo lightbox';
	lightboxButton.addEventListener('click', () => toggleLightbox(combinationId));
	wcagBadges.appendChild(lightboxButton);
	
	contrastRow.appendChild(contrastInfo);
	contrastRow.appendChild(wcagBadges);
	
	// Agregar filas a info
	infoElement.appendChild(colorRow);
	infoElement.appendChild(contrastRow);
	
	// Agregar info a combinación
	combination.appendChild(infoElement);
	
	// Panel de corrección (inicialmente oculto)
	const correctionPanel = document.createElement('div');
	correctionPanel.className = 'correction-panel';
	correctionPanel.id = `correction-${combinationId}`;
	correctionPanel.innerHTML = `
		<div class="correction-title">
			<span>Mejorar Contraste</span>
			<button class="icon-only close-correction">
				<span class="material-symbols-outlined">close</span>
			</button>
		</div>
		<div class="correction-options">
			<div class="correction-option" data-type="background">
				<div class="correction-preview" id="preview-bg-${combinationId}"></div>
				<div>
					<strong>Ajustar fondo</strong>
					<div>Modifica solo el color de fondo</div>
				</div>
			</div>
			<div class="correction-option" data-type="text">
				<div class="correction-preview" id="preview-text-${combinationId}"></div>
				<div>
					<strong>Ajustar texto</strong>
					<div>Modifica solo el color de texto</div>
				</div>
			</div>
		</div>
		<div class="correction-actions" style="display: none;">
			<button class="apply-correction" data-action="global">
				<span class="material-symbols-outlined">check_circle</span>
				Aplicar globalmente
			</button>
			<button class="apply-correction" data-action="add">
				<span class="material-symbols-outlined">add_circle</span>
				Añadir a paleta
			</button>
			<button class="apply-correction" data-action="cancel">
				<span class="material-symbols-outlined">cancel</span>
				Descartar
			</button>
		</div>
	`;
	combination.appendChild(correctionPanel);
	
	// Configurar eventos del panel de corrección
	correctionPanel.querySelector('.close-correction').addEventListener('click', () => {
		closeCorrectionPanel(combinationId);
	});
	
	const correctionOptions = correctionPanel.querySelectorAll('.correction-option');
	correctionOptions.forEach(option => {
		option.addEventListener('click', (e) => {
			selectCorrectionOption(e, combinationId, bgColor, textColor);
		});
	});
	
	const applyButtons = correctionPanel.querySelectorAll('.apply-correction');
	applyButtons.forEach(button => {
		button.addEventListener('click', (e) => {
			applyCorrection(e, combinationId, bgColor, textColor);
		});
	});
	
	// Agregar la combinación al contenedor
	container.appendChild(combination);
	
	// Animación de entrada
	combination.style.opacity = '0';
	combination.style.transform = 'translateY(20px)';
	setTimeout(() => {
		combination.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
		combination.style.opacity = '1';
		combination.style.transform = 'translateY(0)';
	}, 50);
}

function calculateContrastRatio(color1, color2) {
	const getLuminance = (color) => {
		const rgb = parseInt(color.slice(1), 16);
		const r = (rgb >> 16) & 0xff;
		const g = (rgb >>  8) & 0xff;
		const b = (rgb >>  0) & 0xff;
		
		const rsrgb = r / 255;
		const gsrgb = g / 255;
		const bsrgb = b / 255;
		
		const r1 = rsrgb <= 0.03928 ? rsrgb / 12.92 : Math.pow((rsrgb + 0.055) / 1.055, 2.4);
		const g1 = gsrgb <= 0.03928 ? gsrgb / 12.92 : Math.pow((gsrgb + 0.055) / 1.055, 2.4);
		const b1 = bsrgb <= 0.03928 ? bsrgb / 12.92 : Math.pow((bsrgb + 0.055) / 1.055, 2.4);
		
		return 0.2126 * r1 + 0.7152 * g1 + 0.0722 * b1;
	};
	
	const l1 = getLuminance(color1);
	const l2 = getLuminance(color2);
	
	return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

// ------------------------------
// Corrección de contraste
// ------------------------------
// ------------------------------
// Modal de edición de color
// ------------------------------
function openColorEditModal(mode, combinationId, color, colorId, textColor = null, textColorId = null) {
	// Guardar datos para su uso posterior
	currentEditData = {
		mode: mode,
		combinationId: combinationId,
		color: color,
		colorId: colorId,
		textColor: textColor,
		textColorId: textColorId,
		originalColor: color
	};
	
	// Configurar el modal según el modo
	const modal = document.getElementById('color-edit-modal');
	const modalTitle = modal.querySelector('.color-edit-title');
	const preview = document.getElementById('color-edit-preview-text');
	const picker = document.getElementById('color-edit-picker');
	
	// Restaurar formato a hexadecimal para el selector
	currentEditFormat = 'hex';
	document.querySelectorAll('#color-edit-modal .format-button').forEach(btn => {
		btn.classList.remove('active');
	});
	document.querySelector('#color-edit-modal .format-button[data-format="hex"]').classList.add('active');
	
	// Configurar el modal según el modo
	switch (mode) {
		case 'background':
			modalTitle.textContent = 'Editar Color de Fondo';
			document.querySelector('.color-edit-bg').style.backgroundColor = color;
			document.querySelector('.color-edit-text').style.backgroundColor = getComputedStyle(document.documentElement).getPropertyValue('--bg-color');
			if (textColor) {
				preview.style.color = textColor;
			}
			break;
		case 'text':
			modalTitle.textContent = 'Editar Color de Texto';
			document.querySelector('.color-edit-bg').style.backgroundColor = getComputedStyle(document.documentElement).getPropertyValue('--bg-color');
			document.querySelector('.color-edit-text').style.backgroundColor = color;
			if (textColor) {
				document.querySelector('.color-edit-bg').style.backgroundColor = textColor;
			}
			preview.style.color = color;
			break;
		case 'correction':
			modalTitle.textContent = 'Corregir Contraste';
			document.querySelector('.color-edit-bg').style.backgroundColor = color;
			document.querySelector('.color-edit-text').style.backgroundColor = getComputedStyle(document.documentElement).getPropertyValue('--bg-color');
			preview.style.color = textColor;
			
			// Añadir botón de autoajuste
			const autoFixButton = document.createElement('button');
			autoFixButton.innerHTML = '<span class="material-symbols-outlined">auto_fix</span> Autoajustar';
			autoFixButton.className = 'primary';
			autoFixButton.style.marginBottom = '10px';
			autoFixButton.onclick = () => {
				const correctedColor = generateCorrectedColor(color, textColor, mode === 'background' ? 'background' : 'text');
				picker.value = correctedColor;
				updateColorEditPreview();
			};
			
			// Insertar antes de los controles
			const controls = document.querySelector('.color-edit-controls');
			if (!document.getElementById('auto-fix-button')) {
				autoFixButton.id = 'auto-fix-button';
				controls.parentNode.insertBefore(autoFixButton, controls);
			}
			break;
	}
	
	// Configurar valor inicial
	picker.value = color;
	
	// Configurar valores de texto
	document.getElementById('color-edit-value').value = formatColor(color, currentEditFormat);
	
	// Configurar la comparación antes/después
	const originalElement = document.querySelector('.color-edit-original');
	const modifiedElement = document.querySelector('.color-edit-modified');
	
	if (mode === 'background') {
		originalElement.style.backgroundColor = color;
		modifiedElement.style.backgroundColor = color;
	} else if (mode === 'text') {
		originalElement.style.color = color;
		modifiedElement.style.color = color;
		originalElement.style.backgroundColor = textColor || '#FFFFFF';
		modifiedElement.style.backgroundColor = textColor || '#FFFFFF';
	}
	
	// Mostrar modal
	modal.classList.add('visible');
}

function closeColorEditModal() {
	const modal = document.getElementById('color-edit-modal');
	modal.classList.remove('visible');
	
	// Eliminar botón de autoajuste si existe
	const autoFixButton = document.getElementById('auto-fix-button');
	if (autoFixButton) {
		autoFixButton.remove();
	}
	
	// Limpiar datos
	currentEditData = null;
}

function updateColorEditPreview() {
	if (!currentEditData) return;
	
	const picker = document.getElementById('color-edit-picker');
	const colorValue = document.getElementById('color-edit-value');
	
	// Obtener valores actuales
	const color = picker.value;
	
	// Actualizar valor de texto
	colorValue.value = formatColor(color, currentEditFormat);
	
	// Obtener el elemento modificado para la comparación
	const modifiedElement = document.querySelector('.color-edit-modified');
	
	// Actualizar previsualización según el modo
	if (currentEditData.mode === 'background') {
		document.querySelector('.color-edit-bg').style.backgroundColor = color;
		modifiedElement.style.backgroundColor = color;
	} else if (currentEditData.mode === 'text') {
		document.getElementById('color-edit-preview-text').style.color = color;
		modifiedElement.style.color = color;
	} else if (currentEditData.mode === 'correction') {
		if (picker.dataset.target === 'background' || !picker.dataset.target) {
			document.querySelector('.color-edit-bg').style.backgroundColor = color;
			modifiedElement.style.backgroundColor = color;
		} else {
			document.getElementById('color-edit-preview-text').style.color = color;
			modifiedElement.style.color = color;
		}
	}
}

function saveColorEdit() {
	if (!currentEditData) return;
	
	// Obtener valores
	const picker = document.getElementById('color-edit-picker');
	const color = picker.value;
	
	// Guardar estado actual para deshacer
	saveActionToHistory('edit_color');
	
	// Aplicar cambios según el modo
	if (currentEditData.mode === 'background' || 
		(currentEditData.mode === 'correction' && picker.dataset.target === 'background')) {
		
		// Actualizar color de fondo
		const combination = document.getElementById(currentEditData.combinationId);
		combination.style.backgroundColor = color;
		
		// Actualizar info
		const bgColorInfo = combination.querySelector('.bg-color-info');
		const bgColorSwatch = bgColorInfo.querySelector('.color-swatch');
		bgColorSwatch.style.backgroundColor = color;
		
		// Actualizar color en la paleta
		replaceColorInPalette(currentEditData.color, color, currentEditData.colorId);
		
	} else if (currentEditData.mode === 'text' || 
			  (currentEditData.mode === 'correction' && picker.dataset.target === 'text')) {
		
		// Actualizar color de texto
		const combination = document.getElementById(currentEditData.combinationId);
		const textElement = combination.querySelector('.combination-text');
		textElement.style.color = color;
		
		// Actualizar info
		const textColorInfo = combination.querySelector('.text-color-info');
		const textColorSwatch = textColorInfo.querySelector('.color-swatch');
		textColorSwatch.style.backgroundColor = color;
		
		// Actualizar color en la paleta
		replaceColorInPalette(currentEditData.color, color, currentEditData.colorId);
	}
	
	// Cerrar modal
	closeColorEditModal();
	
	// Actualizar combinaciones
	updateCombinations();
	
	// Mostrar notificación
	showNotification('Color actualizado', 'El color se ha actualizado correctamente', 'success');
}

function addColorFromEdit() {
	if (!currentEditData) return;
	
	// Obtener valores
	const picker = document.getElementById('color-edit-picker');
	const color = picker.value;
	
	// Añadir color a la paleta
	addColorInput(color);
	
	// Cerrar modal
	closeColorEditModal();
	
	// Mostrar notificación
	showNotification('Color añadido', 'El color se ha añadido a la paleta', 'success');
}

// ------------------------------
// Corrección de contraste
// ------------------------------
function openCorrectionPanel(combinationId, bgColor, textColor, bgColorId, textColorId) {
	// Guardar estado actual para deshacer
	saveActionToHistory('open_correction');
	
	// En lugar de abrir el panel, abrir el modal de edición con opción de autoajuste
	openColorEditModal('correction', combinationId, bgColor, bgColorId, textColor, textColorId);
}

function closeCorrectionPanel(combinationId) {
	const correctionPanel = document.getElementById(`correction-${combinationId}`);
	correctionPanel.classList.remove('visible');
	
	// Resetear selecciones
	const options = correctionPanel.querySelectorAll('.correction-option');
	options.forEach(option => option.classList.remove('selected'));
}

function selectCorrectionOption(event, combinationId, bgColor, textColor) {
	const option = event.currentTarget;
	const correctionType = option.dataset.type;
	const combination = document.getElementById(combinationId);
	const correctionPanel = document.getElementById(`correction-${combinationId}`);
	
	// Actualizar selección visual
	const options = correctionPanel.querySelectorAll('.correction-option');
	options.forEach(opt => opt.classList.remove('selected'));
	option.classList.add('selected');
	
	// Aplicar corrección temporalmente
	if (correctionType === 'background') {
		const correctedColor = generateCorrectedColor(bgColor, textColor, 'background');
		combination.style.backgroundColor = correctedColor;
		// Guardar la corrección para uso posterior
		combination.dataset.correctedColor = correctedColor;
		combination.dataset.correctionType = 'background';
	} else {
		const correctedColor = generateCorrectedColor(bgColor, textColor, 'text');
		combination.querySelector('.combination-text').style.color = correctedColor;
		// Guardar la corrección para uso posterior
		combination.dataset.correctedColor = correctedColor;
		combination.dataset.correctionType = 'text';
	}
	
	// Mostrar botones de acción
	correctionPanel.querySelector('.correction-actions').style.display = 'flex';
}

function applyCorrection(event, combinationId, originalBg, originalText) {
	const button = event.currentTarget;
	const action = button.dataset.action;
	const combination = document.getElementById(combinationId);
	const correctionType = combination.dataset.correctionType;
	const correctedColor = combination.dataset.correctedColor;
	
	if (!correctedColor || !correctionType) {
		closeCorrectionPanel(combinationId);
		return;
	}
	
	// Aplicar la acción según corresponda
	switch (action) {
		case 'global':
			// Reemplazar color en toda la paleta
			if (correctionType === 'background') {
				replaceColorInPalette(originalBg, correctedColor);
			} else {
				replaceColorInPalette(originalText, correctedColor);
			}
			showNotification('Color actualizado', 'Se aplicó el color corregido a toda la paleta', 'success');
			break;
			
		case 'add':
			// Añadir nuevo color a la paleta
			addColorInput(correctedColor);
			showNotification('Color añadido', 'Se agregó el color corregido a la paleta', 'success');
			break;
			
		case 'cancel':
			// Restaurar colores originales
			combination.style.backgroundColor = originalBg;
			combination.querySelector('.combination-text').style.color = originalText;
			break;
	}
	
	// Cerrar panel
	closeCorrectionPanel(combinationId);
	
	// Actualizar combinaciones si fue necesario
	if (action !== 'cancel') {
		updateCombinations();
	}
}

function generateCorrectedColor(bgColor, textColor, type) {
	const targetRatio = 4.5; // AA normal text
	const currentRatio = calculateContrastRatio(bgColor, textColor);
	
	if (currentRatio >= targetRatio) return type === 'background' ? bgColor : textColor;
	
	// Convertir a RGB
	const bgRGB = hexToRgb(bgColor);
	const textRGB = hexToRgb(textColor);
	
	// Convertir a HSL para manipular
	const bgHSL = rgbToHsl(bgRGB.r, bgRGB.g, bgRGB.b);
	const textHSL = rgbToHsl(textRGB.r, textRGB.g, textRGB.b);
	
	if (type === 'background') {
		// Ajustar luminosidad del fondo
		return adjustColorLuminosityForContrast(bgColor, textColor, 'background');
	} else {
		// Ajustar luminosidad del texto
		return adjustColorLuminosityForContrast(bgColor, textColor, 'text');
	}
}

function adjustColorLuminosityForContrast(bgColor, textColor, type) {
	const targetRatio = 4.5; // AA for normal text
	let original = type === 'background' ? bgColor : textColor;
	let fixed = type === 'background' ? textColor : bgColor;
	
	// Convertir a RGB
	const origRGB = hexToRgb(original);
	
	// Convertir a HSL para mantener el tono
	const origHSL = rgbToHsl(origRGB.r, origRGB.g, origRGB.b);
	
	// Determinar si necesitamos aclarar u oscurecer
	const bgLuminance = getLuminance(bgColor);
	const textLuminance = getLuminance(textColor);
	
	let needToDarken;
	
	if (type === 'background') {
		needToDarken = bgLuminance > textLuminance;
	} else {
		needToDarken = bgLuminance <= textLuminance;
	}
	
	// Ajustar la luminosidad hasta alcanzar el contraste objetivo
	let newColor = original;
	let step = needToDarken ? -1 : 1;
	let newLum = origHSL.l;
	let iterations = 0;
	const maxIterations = 100;
	
	while (iterations < maxIterations) {
		// Ajustar la luminosidad (entre 0 y 100)
		newLum = Math.max(0, Math.min(100, newLum + step));
		
		// Crear nuevo color
		const newHSL = {h: origHSL.h, s: origHSL.s, l: newLum};
		const newRGB = hslToRgb(newHSL.h, newHSL.s, newHSL.l);
		newColor = rgbToHex(newRGB.r, newRGB.g, newRGB.b);
		
		// Calcular nuevo contraste
		const ratio = type === 'background' 
			? calculateContrastRatio(newColor, fixed)
			: calculateContrastRatio(fixed, newColor);
		
		// Verificar si hemos alcanzado el objetivo
		if (ratio >= targetRatio) {
			return newColor;
		}
		
		// Verificar si hemos llegado a los límites
		if ((needToDarken && newLum <= 0) || (!needToDarken && newLum >= 100)) {
			// Si no podemos ajustar más, intentar ajustar la saturación
			break;
		}
		
		iterations++;
	}
	
	// Si no se pudo lograr solo con luminosidad, ajustar también la saturación
	// Este es un enfoque simplificado que podría refinarse más
	if (type === 'background') {
		return needToDarken ? '#000000' : '#FFFFFF';
	} else {
		return needToDarken ? '#000000' : '#FFFFFF';
	}
}

function hexToRgb(hex) {
	const r = parseInt(hex.slice(1, 3), 16);
	const g = parseInt(hex.slice(3, 5), 16);
	const b = parseInt(hex.slice(5, 7), 16);
	return {r, g, b};
}

function rgbToHex(r, g, b) {
	return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1).toUpperCase()}`;
}

function hslToRgb(h, s, l) {
	h /= 360;
	s /= 100;
	l /= 100;
	
	let r, g, b;
	
	if (s === 0) {
		r = g = b = l; // Achromatic
	} else {
		const hue2rgb = (p, q, t) => {
			if (t < 0) t += 1;
			if (t > 1) t -= 1;
			if (t < 1/6) return p + (q - p) * 6 * t;
			if (t < 1/2) return q;
			if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
			return p;
		};
		
		const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
		const p = 2 * l - q;
		
		r = hue2rgb(p, q, h + 1/3);
		g = hue2rgb(p, q, h);
		b = hue2rgb(p, q, h - 1/3);
	}
	
	return {
		r: Math.round(r * 255),
		g: Math.round(g * 255),
		b: Math.round(b * 255)
	};
}

function getLuminance(color) {
	const rgb = parseInt(color.slice(1), 16);
	const r = (rgb >> 16) & 0xff;
	const g = (rgb >>  8) & 0xff;
	const b = (rgb >>  0) & 0xff;
	
	const rsrgb = r / 255;
	const gsrgb = g / 255;
	const bsrgb = b / 255;
	
	const r1 = rsrgb <= 0.03928 ? rsrgb / 12.92 : Math.pow((rsrgb + 0.055) / 1.055, 2.4);
	const g1 = gsrgb <= 0.03928 ? gsrgb / 12.92 : Math.pow((gsrgb + 0.055) / 1.055, 2.4);
	const b1 = bsrgb <= 0.03928 ? bsrgb / 12.92 : Math.pow((bsrgb + 0.055) / 1.055, 2.4);
	
	return 0.2126 * r1 + 0.7152 * g1 + 0.0722 * b1;
}

function replaceColorInPalette(oldColor, newColor, specificColorId = null) {
	const colorInputs = document.querySelectorAll('#color-inputs .color-input');
	
	for (const colorInput of colorInputs) {
		const colorId = colorInput.dataset.colorId;
		const colorPicker = colorInput.querySelector('input[type="color"]');
		
		// Si se proporciona un ID específico, actualizar solo ese color
		if (specificColorId && colorId !== specificColorId) {
			continue;
		}
		
		if (specificColorId || colorPicker.value.toUpperCase() === oldColor.toUpperCase()) {
			colorPicker.value = newColor;
			
			// Actualizar el valor de texto según el formato
			const format = colorFormats[colorId];
			const textInput = colorInput.querySelector('input[type="text"]');
			textInput.value = formatColor(newColor, format);
		}
	}
}

// ------------------------------
// Gestión de tema
// ------------------------------
function toggleTheme() {
	document.body.classList.toggle('dark-theme');
	currentTheme = document.body.classList.contains('dark-theme') ? 'dark' : 'light';
	
	// Actualizar icono del botón
	const iconElement = document.querySelector('#theme-toggle .material-symbols-outlined');
	iconElement.textContent = currentTheme === 'dark' ? 'light_mode' : 'dark_mode';
	
	// Guardar preferencia
	localStorage.setItem('colorCombinator.theme', currentTheme);
}

function setTheme(theme) {
	if (theme === 'dark') {
		document.body.classList.add('dark-theme');
		document.querySelector('#theme-toggle .material-symbols-outlined').textContent = 'light_mode';
	} else {
		document.body.classList.remove('dark-theme');
		document.querySelector('#theme-toggle .material-symbols-outlined').textContent = 'dark_mode';
	}
	currentTheme = theme;
}

function updateThemeColors() {
	const lightBgColor = document.getElementById('light-bg-color').value;
	const darkBgColor = document.getElementById('dark-bg-color').value;
	
	document.documentElement.style.setProperty('--light-bg-color', lightBgColor);
	document.documentElement.style.setProperty('--dark-bg-color', darkBgColor);
	
	// Guardar en localStorage
	localStorage.setItem('colorCombinator.lightBgColor', lightBgColor);
	localStorage.setItem('colorCombinator.darkBgColor', darkBgColor);
}

// ------------------------------
// Notificaciones
// ------------------------------
function showNotification(title, message, type = 'info') {
	const container = document.getElementById('notification-container');
	const notificationId = `notification-${Date.now()}`;
	
	const notification = document.createElement('div');
	notification.className = `notification ${type}`;
	notification.id = notificationId;
	
	// Icono según el tipo
	let icon;
	switch (type) {
		case 'success':
			icon = 'check_circle';
			break;
		case 'error':
			icon = 'error';
			break;
		case 'info':
		default:
			icon = 'info';
			break;
	}
	
	notification.innerHTML = `
		<div class="notification-icon">
			<span class="material-symbols-outlined">${icon}</span>
		</div>
		<div class="notification-content">
			<div class="notification-title">${title}</div>
			<div class="notification-message">${message}</div>
		</div>
		<button class="notification-close">
			<span class="material-symbols-outlined">close</span>
		</button>
	`;
	
	container.appendChild(notification);
	
	// Botón de cierre
	notification.querySelector('.notification-close').addEventListener('click', () => {
		closeNotification(notificationId);
	});
	
	// Cierre automático después de 5 segundos
	setTimeout(() => {
		if (document.getElementById(notificationId)) {
			closeNotification(notificationId);
		}
	}, 5000);
}

function closeNotification(id) {
	const notification = document.getElementById(id);
	if (notification) {
		notification.style.transform = 'translateX(120%)';
		
		// Eliminar después de la animación
		setTimeout(() => {
			if (notification.parentNode) {
				notification.parentNode.removeChild(notification);
			}
		}, 300);
	}
}

// ------------------------------
// Importación y exportación
// ------------------------------
function validateCoolorsUrl() {
	const urlInput = document.getElementById('coolors-url');
	const importButton = document.getElementById('import-coolors');
	
	// Validar URL
	const isValid = urlInput.value.trim() && urlInput.value.includes('coolors.co');
	
	// Habilitar/deshabilitar botón
	importButton.disabled = !isValid;
	
	return isValid;
}

function importCoolors() {
	const urlInput = document.getElementById('coolors-url').value.trim();
	
	if (!validateCoolorsUrl()) {
		showNotification('Error de importación', 'Por favor, ingresa una URL válida de Coolors', 'error');
		return;
	}
	
	try {
		// Guardar estado actual para deshacer
		saveActionToHistory('import_coolors');
		
		// Extraer colores de la URL
		let urlSegments = urlInput.split('/');
		let colorString = urlSegments[urlSegments.length - 1];
		
		// Limpiar posibles parámetros adicionales
		colorString = colorString.split('?')[0];
		colorString = colorString.split('#')[0];
		
		// Separar cada color
		let colorArray = colorString.split('-');
		let validColors = [];
		
		// Verificar y formatear colores
		colorArray.forEach(color => {
			if (color && color.length) {
				// Formatear correctamente
				if (!color.startsWith('#')) {
					color = `#${color}`;
				}
				
				// Verificar formato válido
				if (/^#[0-9A-F]{6}$/i.test(color)) {
					validColors.push(color.toUpperCase());
				}
			}
		});
		
		if (validColors.length === 0) {
			showNotification('Error de importación', 'No se encontraron colores válidos en la URL', 'error');
			return;
		}
		
		// Reemplazar paleta actual
		const colorInputsContainer = document.getElementById('color-inputs');
		colorInputsContainer.innerHTML = '';
		
		validColors.forEach(color => {
			addColorInput(color, 0);
		});
		
		// Actualizar combinaciones
		updateCombinations();
		
		showNotification('Paleta importada', `Se importaron ${validColors.length} colores de Coolors`, 'success');
		
		// Limpiar campo
		document.getElementById('coolors-url').value = '';
		document.getElementById('import-coolors').disabled = true;
		
	} catch (error) {
		showNotification('Error de importación', 'Ocurrió un error al procesar la URL', 'error');
		console.error('Error importando colores:', error);
	}
}

function exportCoolors() {
	const colors = getColorsFromInputs();
	
	if (colors.length === 0) {
		showNotification('Error de exportación', 'No hay colores para exportar', 'error');
		return;
	}
	
	// Formatear colores para Coolors (sin el #)
	const formattedColors = colors.map(color => color.color.substring(1));
	
	// Crear URL
	const url = `https://coolors.co/${formattedColors.join('-')}`;
	
	// Copiar al portapapeles
	navigator.clipboard.writeText(url).then(() => {
		showNotification('URL generada', 'La URL de Coolors se ha copiado al portapapeles', 'success');
	}).catch(err => {
		// Si falla la copia, mostrar para que el usuario copie manualmente
		showNotification('URL generada', url, 'info');
	});
}

function copyPaletteToClipboard() {
	const colors = getColorsFromInputs();
	
	if (colors.length === 0) {
		showNotification('Error al copiar', 'No hay colores para copiar', 'error');
		return;
	}
	
	// Formatear colores como texto
	const colorText = colors.map(color => color.color).join(', ');
	
	// Copiar al portapapeles
	navigator.clipboard.writeText(colorText).then(() => {
		showNotification('Paleta copiada', 'Los colores se han copiado al portapapeles', 'success');
	}).catch(err => {
		showNotification('Error al copiar', 'No se pudo copiar al portapapeles', 'error');
	});
}

// ------------------------------
// Funcionalidad de deshacer
// ------------------------------
function saveActionToHistory(actionType) {
	// Si estamos inicializando, no guardar en el historial
	if (isInitializing) return;
	
	// Verificar que actionHistory esté definido
	if (typeof actionHistory === 'undefined' || !Array.isArray(actionHistory)) {
		actionHistory = [];
	}
	
	// Obtener estado actual
	const currentState = {
		colors: getColorsFromInputs(),
		text: document.getElementById('text-input').value,
		colorFormats: { ...colorFormats }
	};
	
	// Guardar estado actual en historial
	actionHistory.push(currentState);
	
	// Limitar el tamaño del historial
	if (actionHistory.length > 20) {
		actionHistory.shift();
	}
	
	// Habilitar botón de deshacer
	document.getElementById('undo-button').disabled = false;
}

function undoLastAction() {
	if (actionHistory.length === 0) {
		return;
	}
	
	// Obtener estado anterior
	const previousState = actionHistory.pop();
	
	// Aplicar estado anterior
	document.getElementById('text-input').value = previousState.text;
	
	// Restaurar formatos
	if (previousState.colorFormats) {
		colorFormats = { ...previousState.colorFormats };
	}
	
	// Restaurar colores
	const colorInputsContainer = document.getElementById('color-inputs');
	colorInputsContainer.innerHTML = '';
	
	// Marcar como inicialización para evitar guardar estos cambios en el historial
	isInitializing = true;
	
	// Añadir los colores del estado anterior
	previousState.colors.forEach(color => {
		if (typeof color === 'object' && color.color) {
			addColorInput(color.color);
		} else if (typeof color === 'string') {
			addColorInput(color);
		}
	});
	
	// Finalizar inicialización
	isInitializing = false;
	
	// Actualizar combinaciones
	updateCombinations();
	
	// Deshabilitar botón si no hay más acciones para deshacer
	if (actionHistory.length === 0) {
		document.getElementById('undo-button').disabled = true;
	}
	
	// Mostrar notificación
	showNotification('Acción deshecha', 'Se ha restaurado el estado anterior', 'info');
}

// ------------------------------
// Lightbox
// ------------------------------
function toggleLightbox(combinationId) {
	const overlay = document.getElementById('lightbox-overlay');
	const combination = document.getElementById(combinationId);
	
	// Si ya hay un lightbox activo, cerrarlo
	if (overlay.classList.contains('visible')) {
		closeLightbox();
		return;
	}
	
	// Activar lightbox
	overlay.classList.add('visible');
	combination.classList.add('lightbox');
	
	// Ajustar posición para que sea visible
	const rect = combination.getBoundingClientRect();
	const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
	
	// Centrar en la pantalla
	const top = scrollTop + (window.innerHeight / 2) - (rect.height / 2);
	combination.style.position = 'fixed';
	combination.style.top = '50%';
	combination.style.left = '50%';
	combination.style.transform = 'translate(-50%, -50%) scale(1.05)';
	combination.style.zIndex = '950';
}

function closeLightbox() {
	const overlay = document.getElementById('lightbox-overlay');
	const activeCombination = document.querySelector('.combination.lightbox');
	
	if (activeCombination) {
		activeCombination.classList.remove('lightbox');
		activeCombination.style.position = '';
		activeCombination.style.top = '';
		activeCombination.style.left = '';
		activeCombination.style.transform = '';
		activeCombination.style.zIndex = '';
	}
	
	overlay.classList.remove('visible');
}

// ------------------------------
// Móvil y responsivo
// ------------------------------
function toggleMobileMenu() {
	const sidebar = document.getElementById('sidebar');
	const overlay = document.getElementById('sidebar-overlay');
	const button = document.getElementById('mobile-menu-toggle');
	const icon = button.querySelector('.material-symbols-outlined');
	
	sidebar.classList.toggle('open');
	overlay.classList.toggle('visible');
	
	// Cambiar icono
	icon.textContent = sidebar.classList.contains('open') ? 'close' : 'menu';
}

function closeMobileMenu() {
	const sidebar = document.getElementById('sidebar');
	const overlay = document.getElementById('sidebar-overlay');
	const button = document.getElementById('mobile-menu-toggle');
	const icon = button.querySelector('.material-symbols-outlined');
	
	sidebar.classList.remove('open');
	overlay.classList.remove('visible');
	icon.textContent = 'menu';
}

// ------------------------------
// Persistencia de estado
// ------------------------------
function getColorsFromInputs() {
	const colorInputs = document.querySelectorAll('#color-inputs .color-input');
	return Array.from(colorInputs).map(input => {
		const colorId = input.dataset.colorId;
		const colorValue = input.querySelector('input[type="color"]').value;
		return {
			id: colorId,
			color: colorValue
		};
	});
}

function saveStateToStorage() {
	try {
		// Guardar colores
		const colors = getColorsFromInputs();
		localStorage.setItem('colorCombinator.colors', JSON.stringify(colors));
		
		// Guardar texto de previsualización
		const previewText = document.getElementById('text-input').value;
		localStorage.setItem('colorCombinator.previewText', previewText);
		
		// Guardar formatos de color
		localStorage.setItem('colorCombinator.colorFormats', JSON.stringify(colorFormats));
		
		// Codificar estado en URL
		updateUrlWithState(colors);
	} catch (e) {
		console.error('Error saving state to storage:', e);
	}
}

function loadStateFromUrlOrStorage() {
	// Prioridad: URL > localStorage
	const urlState = getStateFromUrl();
	
	if (urlState && urlState.colors && urlState.colors.length > 0) {
		// Cargar desde URL
		applyState(urlState);
	} else {
		// Cargar desde localStorage si existe
		loadStateFromStorage();
	}
}

function loadStateFromStorage() {
	// Texto de previsualización
	const savedText = localStorage.getItem('colorCombinator.previewText');
	if (savedText) {
		document.getElementById('text-input').value = savedText;
	}
	
	// Formatos de color
	const savedFormats = localStorage.getItem('colorCombinator.colorFormats');
	if (savedFormats) {
		try {
			colorFormats = JSON.parse(savedFormats);
		} catch (e) {
			console.error('Error parsing saved color formats', e);
			colorFormats = {};
		}
	}
	
	// Colores de tema
	const lightBgColor = localStorage.getItem('colorCombinator.lightBgColor');
	const darkBgColor = localStorage.getItem('colorCombinator.darkBgColor');
	
	if (lightBgColor) {
		document.getElementById('light-bg-color').value = lightBgColor;
		document.documentElement.style.setProperty('--light-bg-color', lightBgColor);
	}
	
	if (darkBgColor) {
		document.getElementById('dark-bg-color').value = darkBgColor;
		document.documentElement.style.setProperty('--dark-bg-color', darkBgColor);
	}
}

function updateUrlWithState(colors) {
	// Crear objeto de estado
	const state = {
		colors: colors
	};
	
	// Codificar en base64 para URL más limpia
	const stateStr = JSON.stringify(state);
	const stateB64 = btoa(stateStr);
	
	// Actualizar URL sin recargar
	const url = new URL(window.location.href);
	url.searchParams.set('s', stateB64);
	
	// Actualizar URL sin recargar
	history.replaceState({}, '', url);
}

function getStateFromUrl() {
	const url = new URL(window.location.href);
	const stateParam = url.searchParams.get('s');
	
	if (!stateParam) return null;
	
	try {
		const stateStr = atob(stateParam);
		return JSON.parse(stateStr);
	} catch (e) {
		console.error('Error parsing state from URL', e);
		return null;
	}
}

function applyState(state) {
	// Aplicar colores desde el estado
	if (state.colors && state.colors.length > 0) {
		// Limpiar colores actuales
		document.getElementById('color-inputs').innerHTML = '';
		
		// Agregar nuevos colores
		state.colors.forEach(color => {
			addColorInput(color);
		});
		
		// Actualizar combinaciones
		updateCombinations();
	}
}

// Iniciar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
	initTheme();
	initColorInputs();
	initEventListeners();
	updateCombinations();
	
	// Intentar cargar desde URL o localStorage
	loadStateFromUrlOrStorage();
});