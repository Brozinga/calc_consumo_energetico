// ========================================
// CONFIGURAÇÕES PADRÃO (Valores Iniciais)
// ========================================

const DEFAULT_VALUES = {
    // Tarifas base (R$/kWh) - Valores da conta outubro/2025 (mais recente)
    TUSD_BASE: 0.45893,
    TE_BASE: 0.30982,
    
    // Bandeira tarifária inicial
    BANDEIRA_INICIAL: 'Verde',
    
    // Impostos (%) - Valores ajustados para situação real
    ICMS_RATE: 18.00, // Valor nominal, mas com isenção ativada por padrão
    ICMS_ISENTO: true, // Novo: controla isenção ICMS
    PIS_COFINS_RATE: 6.13, // Calculado da conta proporcional: 0,53 ÷ (5,14 + 3,47)
    PIS_COFINS_ISENTO: true, // Novo: controla isenção PIS/COFINS (já embutido nas tarifas)
    
    // CIP (R$ fixo)
    CIP_VALUE: 15.93, // Valor fixo mensal
    
    // Bandeiras tarifárias (adicional R$/kWh) - Valores oficiais ANEEL
    BANDEIRAS: {
        'Verde': 0.00000,
        'Amarela': 0.01885,
        'Vermelha P1': 0.04463,
        'Vermelha P2': 0.07877
    }
};

// ========================================
// IDs dos Elementos HTML
// ========================================

const CIP_VALUE_ID = 'cip-value';
const TUSD_BASE_ID = 'tusd-base';
const TE_BASE_ID = 'te-base';

let applianceCount = 0;

// --- Tab Management ---

function showTab(tabId) {
    // Oculta todos os conteúdos das abas
    document.getElementById('tab1').classList.add('d-none');
    document.getElementById('tab2').classList.add('d-none');
    document.getElementById('tab3').classList.add('d-none');
    
    // Remove a classe ativa de todos os botões
    document.getElementById('tab1-btn').classList.remove('active-tab');
    document.getElementById('tab2-btn').classList.remove('active-tab');
    document.getElementById('tab3-btn').classList.remove('active-tab');

    // Exibe o conteúdo da aba selecionada
    document.getElementById(tabId).classList.remove('d-none');
    
    // Adiciona a classe ativa ao botão selecionado
    document.getElementById(tabId + '-btn').classList.add('active-tab');
    
    // Se estiver indo para a Tab 2, atualiza o cálculo de conversão
    if (tabId === 'tab2') {
        calculateKwh();
    }
}

// --- Tariff Data Management ---

// Novo: Função para selecionar o item do Dropdown
function selectBandeira(element, event) {
    if (event) event.preventDefault();
    
    const value = element.getAttribute('data-value');
    const label = element.getAttribute('data-label');
    const colorClass = element.getAttribute('data-color');
    const displayElement = document.getElementById('bandeira-select-display');
    
    // 1. Atualiza o texto visual e a cor do botão (AGORA SÓ COM O NOME DA BANDEIRA)
    const displayContent = `<span class="flag-indicator ${colorClass} me-2"></span> ${label}`;
    displayElement.innerHTML = displayContent;
    
    // 2. Armazena o valor/label para as funções de cálculo lerem
    displayElement.setAttribute('data-value', value);
    displayElement.setAttribute('data-label', label);
    
    // 3. Recalcula e atualiza
    updateBandeiraInfo();
}

// Novo: Função para atualizar a info da bandeira (Dropdown)
function updateBandeiraInfo() {
    const displayElement = document.getElementById('bandeira-select-display');
    const value = displayElement.getAttribute('data-value');

    document.getElementById('bandeira-info').innerHTML = `Adicional: <b>R$ ${parseFloat(value).toFixed(5).replace('.', ',')}</b>`;
    updateTariff();
}

function getTariffData() {
    const displayElement = document.getElementById('bandeira-select-display');
    
    return {
        tusd_base: parseFloat(document.getElementById(TUSD_BASE_ID).value) || 0,
        te_base: parseFloat(document.getElementById(TE_BASE_ID).value) || 0,
        // Armazena APENAS o nome da bandeira do botão de display do Dropdown
        bandeira: displayElement.getAttribute('data-label'),
        cip_value: parseFloat(document.getElementById(CIP_VALUE_ID).value) || 0,
        icms_rate: parseFloat(document.getElementById('icms-rate').value) || 0,
        icms_isento: document.getElementById('icms-isento').checked, // Estado da isenção ICMS
        pis_cofins_rate: parseFloat(document.getElementById('pis-cofins-rate').value) || 0,
        pis_cofins_isento: document.getElementById('pis-cofins-isento').checked // Estado da isenção PIS/COFINS
    };
}

function setTariffData(data) {
    if (data.tarifas) {
        document.getElementById(TUSD_BASE_ID).value = data.tarifas.tusd_base;
        document.getElementById(TE_BASE_ID).value = data.tarifas.te_base;
        document.getElementById(CIP_VALUE_ID).value = data.tarifas.cip_value;
        document.getElementById('icms-rate').value = data.tarifas.icms_rate;
        document.getElementById('pis-cofins-rate').value = data.tarifas.pis_cofins_rate;

        // Carrega o estado dos checkboxes
        if (typeof data.tarifas.icms_isento !== 'undefined') {
            document.getElementById('icms-isento').checked = data.tarifas.icms_isento;
        }
        if (typeof data.tarifas.pis_cofins_isento !== 'undefined') {
            document.getElementById('pis-cofins-isento').checked = data.tarifas.pis_cofins_isento;
        }

        const bandeiraName = data.tarifas.bandeira || "Verde"; // Default to Verde
        
        // Mapeia o nome da bandeira para o item do dropdown correto e simula o clique
        const menuItems = document.querySelectorAll('#bandeira-select-menu a.dropdown-item');
        let foundItem = null;
        
        menuItems.forEach(item => {
            if (item.getAttribute('data-label') === bandeiraName) {
                foundItem = item;
            }
        });

        // Se o item for encontrado, simula a seleção
        if (foundItem) {
             selectBandeira(foundItem);
        } else {
             // Caso contrário, usa o default (Verde)
             const defaultItem = document.querySelector('#bandeira-select-menu a[data-label="Verde"]');
             if (defaultItem) selectBandeira(defaultItem);
        }
        
        // O selectBandeira já chama updateBandeiraInfo e updateTariff
    }
}

// --- Tariff Calculation and Update ---

function calculateUnitCost() {
    const tusdBase = parseFloat(document.getElementById(TUSD_BASE_ID).value) || 0;
    const teBase = parseFloat(document.getElementById(TE_BASE_ID).value) || 0;
    // Lendo o valor da bandeira diretamente do botão de display do dropdown
    const bandeiraValue = parseFloat(document.getElementById('bandeira-select-display').getAttribute('data-value')) || 0;
    
    // Lê as alíquotas de imposto editáveis e converte de porcentagem para decimal
    const icmsRate = (parseFloat(document.getElementById('icms-rate').value) || 0) / 100;
    const pisCofinsRate = (parseFloat(document.getElementById('pis-cofins-rate').value) || 0) / 100;
    
    // Verifica se há isenção de impostos
    const icmsExempt = document.getElementById('icms-isento').checked;
    const pisCofinsExempt = document.getElementById('pis-cofins-isento').checked;
    
    // 1. Custo Base (TUSD + TE)
    const baseLiquida = tusdBase + teBase; 
    
    // 2. Cálculo dos Impostos (apenas se não isentos)
    const custoPisCofins = pisCofinsExempt ? 0 : (baseLiquida * pisCofinsRate);
    const custoIcms = icmsExempt ? 0 : (baseLiquida * icmsRate);
    
    // 3. Custo Total com Impostos
    const custoComImpostos = baseLiquida + custoPisCofins + custoIcms;
    
    // 4. Adiciona a Bandeira por último (como na conta real)
    const unitCostBrute = custoComImpostos + bandeiraValue;

    return unitCostBrute;
}

function updateTariff() {
    const cost = calculateUnitCost();
    const costDisplay = document.getElementById('unit-cost');
    costDisplay.textContent = `R$ ${cost.toFixed(4).replace('.', ',')}`;
    
    // Recalcula a lista de aparelhos com a nova tarifa (Aba 1)
    updateAllApplianceCosts();

    // Recalcula o consumo no Conversor (Aba 2)
    calculateKwh(); 
}

// --- Appliance Calculator (Tab 1) - Core Logic ---

// Utility function to load data into the table
function loadApplianceData(data) {
    // Clear all existing rows and reset counter
    document.getElementById('appliance-list').innerHTML = '';
    applianceCount = 0;
    
    if (!Array.isArray(data) || data.length === 0) {
         // If data is empty, just load an empty table (as requested by the user)
         updateTotalSummary();
         return;
    }

    data.forEach(item => {
        applianceCount++;
        const tableBody = document.getElementById('appliance-list');
        const newRow = tableBody.insertRow();
        newRow.id = `row-${applianceCount}`;
        newRow.className = 'border-top table-light';

        // Appliance Name
        newRow.insertCell().innerHTML = `<input type="text" id="name-${applianceCount}" value="${item.nome || `Aparelho ${applianceCount}`}" class="form-control form-control-sm border-0 p-2 placeholder-color">`;
        
        // kWh/day
        newRow.insertCell().innerHTML = `<input type="number" id="kwh-day-${applianceCount}" value="${item.kwh_dia || 0.0}" min="0" step="0.001" oninput="calculateRow(${applianceCount})" class="form-control form-control-sm border-0 text-center p-2 placeholder-color">`;

        // Days/month
        newRow.insertCell().innerHTML = `<input type="number" id="days-month-${applianceCount}" value="${item.dias_mes || 30}" min="1" max="40" oninput="calculateRow(${applianceCount})" class="form-control form-control-sm border-0 text-center p-2 placeholder-color">`;

        // kWh/month (Output)
        newRow.insertCell().innerHTML = `<span id="kwh-month-${applianceCount}" class="d-block text-center p-2 text-secondary fw-bold">0,00</span>`;

        // Bandeira (Output)
        newRow.insertCell().innerHTML = `<span id="bandeira-month-${applianceCount}" class="d-block text-center p-2 text-secondary fw-bold">R$ 0,00</span>`;

        // Cost (Output)
        const costCell = newRow.insertCell();
        costCell.className = 'd-flex justify-content-center align-items-center pr-1';
        costCell.innerHTML = `
            <span id="cost-month-${applianceCount}" class="d-block text-end fw-medium text-primary p-2 fw-bold mh-40">R$ 0,00</span>
            <button onclick="removeRow(${applianceCount})" class="btn btn-sm btn-outline-danger border-0 ms-2" title="Remover Aparelho">
                <span class="material-symbols-placeholder" style="font-size: 1rem;">❌</span>
            </button>
        `;
        calculateRow(applianceCount);
    });

    // Ensure summary is updated after loading all data
    updateTotalSummary();
}

// Function to load an empty table (used for default)
function loadEmptyData() {
    loadApplianceData([]);
}

function addRow() {
    applianceCount++;
    const tableBody = document.getElementById('appliance-list');
    const newRow = tableBody.insertRow();
    newRow.id = `row-${applianceCount}`;
    newRow.className = 'border-top table-light';

    // Use loadApplianceData's logic for a single new row
    const item = { nome: `Nome do aparelho (Ex: Secador)`, kwh_dia: `0,00`, dias_mes: 30 };

    // Appliance Name
    newRow.insertCell().innerHTML = `<input type="text" id="name-${applianceCount}" placeholder="${item.nome}" class="form-control form-control-sm border-0 p-2 placeholder-color">`;
    
    // kWh/day
    newRow.insertCell().innerHTML = `<input type="number" id="kwh-day-${applianceCount}" placeholder="${item.kwh_dia}" min="0" step="0.001" oninput="calculateRow(${applianceCount})" class="form-control form-control-sm border-0 text-center p-2 placeholder-color">`;

    // Days/month
    newRow.insertCell().innerHTML = `<input type="number" id="days-month-${applianceCount}" placeholder="${item.dias_mes}" min="1" max="40" oninput="calculateRow(${applianceCount})" class="form-control form-control-sm border-0 text-center p-2 placeholder-color">`;

    // kWh/month (Output)
    newRow.insertCell().innerHTML = `<span id="kwh-month-${applianceCount}" class="d-block text-center p-2 text-secondary fw-bold">0,00</span>`;

    // Bandeira (Output)
    newRow.insertCell().innerHTML = `<span id="bandeira-month-${applianceCount}" class="d-block text-center p-2 text-secondary fw-bold">R$ 0,00</span>`;

    // Cost (Output)
    const costCell = newRow.insertCell();
    costCell.className = 'd-flex justify-content-center align-items-center pr-1';
    costCell.innerHTML = `
        <span id="cost-month-${applianceCount}" class="d-block text-end fw-medium text-primary p-2 fw-bold mh-40">R$ 0,00</span>
        <button onclick="removeRow(${applianceCount})" class="btn btn-sm btn-outline-danger border-0 ms-2" title="Remover Aparelho">
            <span class="material-symbols-placeholder" style="font-size: 1rem;">❌</span>
        </button>
    `;
        
    calculateRow(applianceCount);
}

function removeRow(id) {
    const row = document.getElementById(`row-${id}`);
    if (row) {
        row.remove();
        updateTotalSummary();
    }
}

function calculateRow(id) {
    const kwhDayInput = document.getElementById(`kwh-day-${id}`);
    const daysMonthInput = document.getElementById(`days-month-${id}`);
    const kwhMonthSpan = document.getElementById(`kwh-month-${id}`);
    const bandeiraMonthSpan = document.getElementById(`bandeira-month-${id}`);
    const costMonthSpan = document.getElementById(`cost-month-${id}`);

    if (!kwhDayInput || !daysMonthInput) return; // Skip if row removed

    // Converte vírgula para ponto antes do parseFloat
    const kwhDay = parseFloat(kwhDayInput.value.replace(',', '.')) || 0;
    const daysMonth = parseInt(daysMonthInput.value) || 0;
    const unitCost = calculateUnitCost();

    // Pega o valor da bandeira atual
    const bandeiraValue = parseFloat(document.getElementById('bandeira-select-display').getAttribute('data-value')) || 0;

    // Cálculos
    const kwhMonth = kwhDay * daysMonth;
    const bandeiraMonth = kwhMonth * bandeiraValue; // Bandeira = kWh/mês * valor da bandeira
    
    // Custo individual SEM CIP (CIP será adicionado apenas no total final)
    const costMonth = kwhMonth * unitCost;

    // Atualiza os campos
    kwhMonthSpan.textContent = kwhMonth.toFixed(3).replace('.', ',');
    bandeiraMonthSpan.textContent = `R$ ${bandeiraMonth.toFixed(2).replace('.', ',')}`;
    costMonthSpan.textContent = `R$ ${costMonth.toFixed(2).replace('.', ',')}`;

    updateTotalSummary();
}

function updateAllApplianceCosts() {
    // Since we are using an increasing counter, we iterate up to the last known count
    for (let i = 1; i <= applianceCount; i++) {
        // Check if the row still exists before calculating
        if (document.getElementById(`row-${i}`)) {
            calculateRow(i);
        }
    }
}

function updateTotalSummary() {
    let totalKwh = 0;
    let totalBandeira = 0;
    let totalCost = 0;
    let totalKwhDay = 0;

    for (let i = 1; i <= applianceCount; i++) {
        const kwhDayInput = document.getElementById(`kwh-day-${i}`); 
        const kwhMonthSpan = document.getElementById(`kwh-month-${i}`);
        const bandeiraMonthSpan = document.getElementById(`bandeira-month-${i}`);
        const costMonthSpan = document.getElementById(`cost-month-${i}`);

        if (kwhDayInput && kwhMonthSpan && costMonthSpan) {
            // Cálculo kWh/dia total (com suporte a vírgula):
            const kwhDay = parseFloat(kwhDayInput.value.replace(',', '.')) || 0;
            totalKwhDay += kwhDay;
            
            // Cálculo dos totais (SEM incluir CIP individual):
            const kwh = parseFloat(kwhMonthSpan.textContent.replace(',', '.')) || 0;
            const bandeira = parseFloat(bandeiraMonthSpan?.textContent.replace('R$ ', '').replace(',', '.')) || 0;
            const costText = costMonthSpan.textContent.replace('R$ ', '').replace(',', '.');
            const cost = parseFloat(costText) || 0;
            
            totalKwh += kwh;
            totalBandeira += bandeira;
            totalCost += cost;
        }
    }

    // CIP aplicado apenas UMA VEZ no total final (valor fixo)
    const cipValue = parseFloat(document.getElementById('cip-value').value) || 0;
    
    const finalCostWithCip = totalCost + cipValue;

    // Atualiza os campos de resumo
    document.getElementById('total-kwh-day').innerHTML = `${totalKwhDay.toFixed(3).replace('.', ',')}`;
    document.getElementById('total-kwh').innerHTML = `${totalKwh.toFixed(3).replace('.', ',')}`;
    document.getElementById('total-cost').innerHTML = `<b>R$ ${totalCost.toFixed(2).replace('.', ',')}</b>`;
    document.getElementById('final-cost').innerHTML = `<b>R$ ${finalCostWithCip.toFixed(2).replace('.', ',')}</b>`;
    document.getElementById('final-cip').innerHTML = cipValue.toFixed(2).replace('.', ',');
}

// --- Data Management (JSON) ---

function downloadJson(filename, jsonContent) {
    const element = document.createElement('a');
    element.setAttribute('href', 'data:application/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(jsonContent, null, 2)));
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}

function downloadTemplate() {
    const templateData = {
        "tarifas": {
            "tusd_base": DEFAULT_VALUES.TUSD_BASE,
            "te_base": DEFAULT_VALUES.TE_BASE,
            "bandeira": "Vermelha P2", 
            "cip_value": DEFAULT_VALUES.CIP_VALUE,
            "cip_max": DEFAULT_VALUES.CIP_MAX,
            "icms_rate": DEFAULT_VALUES.ICMS_RATE,
            "icms_isento": DEFAULT_VALUES.ICMS_ISENTO,
            "pis_cofins_rate": DEFAULT_VALUES.PIS_COFINS_RATE,
            "pis_cofins_isento": DEFAULT_VALUES.PIS_COFINS_ISENTO
        },
        "aparelhos": [
            {
                "nome": "Geladeira",
                "kwh_dia": 1.5,
                "dias_mes": 30
            },
            {
                "nome": "Ar Condicionado (Uso 4h)",
                "kwh_dia": 3.0,
                "dias_mes": 20
            }
        ]
    };
    downloadJson('template_aparelhos.json', templateData);
}

function validateDataBeforeDownload() {
    const errors = [];
    
    // 1. Validar campos de Tarifas
    const tusdBase = parseFloat(document.getElementById('tusd-base').value);
    const teBase = parseFloat(document.getElementById('te-base').value);
    const cipValue = parseFloat(document.getElementById('cip-value').value);
    const icmsRate = parseFloat(document.getElementById('icms-rate').value);
    const pisCofinsRate = parseFloat(document.getElementById('pis-cofins-rate').value);
    
    if (!tusdBase || tusdBase <= 0) {
        errors.push("• TUSD Base deve estar preenchido e maior que 0");
    }
    if (!teBase || teBase <= 0) {
        errors.push("• TE Base deve estar preenchido e maior que 0");
    }
    if (isNaN(cipValue) || cipValue < 0) {
        errors.push("• CIP deve estar preenchido e não pode ser negativo");
    }
    if (!icmsRate || icmsRate < 0 || icmsRate > 100) {
        errors.push("• ICMS deve estar preenchido e entre 0 e 100%");
    }
    if (!pisCofinsRate || pisCofinsRate < 0 || pisCofinsRate > 100) {
        errors.push("• PIS/COFINS deve estar preenchido e entre 0 e 100%");
    }
    
    // 2. Validar Lista de Aparelhos
    let hasValidAppliances = false;
    for (let i = 1; i <= applianceCount; i++) {
        const row = document.getElementById(`row-${i}`);
        if (row) {
            const nomeInput = document.getElementById(`name-${i}`);
            const kwhDayInput = document.getElementById(`kwh-day-${i}`);
            const daysMonthInput = document.getElementById(`days-month-${i}`);
            
            const nome = nomeInput?.value?.trim();
            const kwhDay = parseFloat(kwhDayInput?.value?.replace(',', '.')) || 0;
            const daysMonth = parseInt(daysMonthInput?.value) || 0;
            
            if (nome && kwhDay > 0 && daysMonth > 0) {
                hasValidAppliances = true;
            } else if (nome || kwhDay > 0 || daysMonth > 0) {
                // Aparelho parcialmente preenchido
                errors.push(`• Aparelho "${nome || `Linha ${i}`}": todos os campos devem estar preenchidos`);
            }
        }
    }
    
    if (!hasValidAppliances) {
        errors.push("• Pelo menos um aparelho deve estar completamente preenchido");
    }
    
    return {
        isValid: errors.length === 0,
        errors: errors
    };
}

function downloadCurrentData() {
    // Validar dados antes do download
    const validation = validateDataBeforeDownload();
    
    if (!validation.isValid) {
        const errorMessage = "❌ Não é possível baixar os dados. Corrija os seguintes problemas:\n\n" + validation.errors.join("\n");
        alert(errorMessage);
        return;
    }
    
    let currentApplianceData = [];
    // Iterar sobre as linhas visíveis na tabela
    for (let i = 1; i <= applianceCount; i++) {
        const row = document.getElementById(`row-${i}`);
        if (row) {
            const nome = document.getElementById(`name-${i}`).value?.trim();
            const kwh_dia = parseFloat(document.getElementById(`kwh-day-${i}`).value?.replace(',', '.')) || 0;
            const dias_mes = parseInt(document.getElementById(`days-month-${i}`).value) || 0;
            
            // Só adiciona aparelhos que estão completamente preenchidos
            if (nome && kwh_dia > 0 && dias_mes > 0) {
                currentApplianceData.push({
                    nome: nome,
                    kwh_dia: kwh_dia,
                    dias_mes: dias_mes
                });
            }
        }
    }
    
    const fullData = {
        // Apenas o nome da bandeira é exportado
        "tarifas": getTariffData(),
        "aparelhos": currentApplianceData
    };

    downloadJson('dados_aparelhos_exportados.json', fullData);
    
    // Mensagem de sucesso
    alert(`✅ Dados exportados com sucesso!\n\n📊 Tarifas: Configuradas\n🏠 Aparelhos: ${currentApplianceData.length} item(ns)`);
}

function handleFileUpload() {
    const fileInput = document.getElementById('file-input');
    const file = fileInput.files[0];

    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(event) {
        try {
            const data = JSON.parse(event.target.result);
            
            // Load Tariffs
            setTariffData(data); 

            // Load Appliances
            if (data.aparelhos) {
                loadApplianceData(data.aparelhos);
                alert(`Dados de tarifas e ${data.aparelhos.length} aparelhos carregados com sucesso!`);
            } else {
                alert("Dados de tarifas carregados, mas a lista de aparelhos estava vazia ou faltando.");
                loadEmptyData();
            }
        } catch (e) {
            alert("Erro ao ler ou processar o arquivo JSON. Verifique o formato.");
            console.error("Erro ao carregar arquivo:", e);
            loadEmptyData(); // Fallback
        }
    };
    reader.readAsText(file);
    // Clear the file input after reading
    fileInput.value = ''; 
}

// --- Converter (Tab 2) ---

function calculateKwh() {
    const watts = parseFloat(document.getElementById('input-watts').value.replace(',', '.')) || 0;
    const minutes = parseFloat(document.getElementById('input-hours').value.replace(',', '.')) || 0;
    const days = parseInt(document.getElementById('input-days').value) || 0;

    // Converte minutos para horas
    const hours = minutes / 60;

    // Consumo Diário: (W * h/dia) / 1000
    const kwhDay = (watts * hours) / 1000;
    
    // Arredonda o consumo diário para 3 casas decimais (como seria digitado na Lista)
    const kwhDayRounded = Math.round(kwhDay * 1000) / 1000;
    
    // Consumo Mensal: usa o valor arredondado multiplicado pelos dias
    const kwhMonth = kwhDayRounded * days;
    
    document.getElementById('output-kwh').textContent = kwhMonth.toFixed(3).replace('.', ',');
    document.getElementById('output-kwh-day').textContent = kwhDayRounded.toFixed(3).replace('.', ',');
}

// --- Initialization ---

function initializeDefaultValues() {
    // Carrega valores padrão nos campos
    document.getElementById(TUSD_BASE_ID).value = DEFAULT_VALUES.TUSD_BASE;
    document.getElementById(TE_BASE_ID).value = DEFAULT_VALUES.TE_BASE;
    document.getElementById(CIP_VALUE_ID).value = DEFAULT_VALUES.CIP_VALUE;
    document.getElementById('icms-rate').value = DEFAULT_VALUES.ICMS_RATE;
    document.getElementById('pis-cofins-rate').value = DEFAULT_VALUES.PIS_COFINS_RATE;
    
    // Ativa as isenções por padrão
    document.getElementById('icms-isento').checked = DEFAULT_VALUES.ICMS_ISENTO || false;
    document.getElementById('pis-cofins-isento').checked = DEFAULT_VALUES.PIS_COFINS_ISENTO || false;
}

document.addEventListener('DOMContentLoaded', () => {
    // 1. Inicializa valores padrão
    initializeDefaultValues();
    
    // 2. Initialize the tariff calculation and display
    // Chamada inicial para garantir que o botão Dropdown com a bandeira inicial seja ativado
    const initialItem = document.querySelector(`#bandeira-select-menu a[data-label="${DEFAULT_VALUES.BANDEIRA_INICIAL}"]`);
    if (initialItem) {
        selectBandeira(initialItem);
    } else {
        updateTariff();
    }
    
    // 3. Load an empty appliance list (starting empty as requested)
    loadEmptyData();
    
    // 4. Show the first tab by default
    showTab('tab1');
});

// CIP input listener for immediate final cost update
document.getElementById(CIP_VALUE_ID).addEventListener('input', updateTotalSummary);
