# 💡 Calculadora de Consumo Elétrico - Enel SP

Uma aplicação web interativa para calcular o custo aproximado de energia elétrica dos seus aparelhos, baseada nas tarifas da Enel São Paulo.

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)
![Bootstrap](https://img.shields.io/badge/Bootstrap-7952B3?style=flat&logo=bootstrap&logoColor=white)

## 📋 Sobre o Projeto

Esta calculadora permite que você:
- **Calcule o consumo mensal** de todos os seus aparelhos elétricos
- **Converta potência** (Watts) para consumo em kWh
- **Configure tarifas personalizadas** baseadas na sua conta de luz
- **Importe/Exporte dados** em formato JSON
- **Acompanhe custos** incluindo impostos, bandeiras tarifárias e CIP

## ✨ Funcionalidades

### 🔌 Calculadora de Aparelhos
- Adicione múltiplos aparelhos com consumo diário e dias de uso por mês
- Cálculo automático do consumo mensal (kWh) e custo
- Visualização do consumo médio por dia
- Remoção individual de aparelhos
- Resumo total com CIP (Contribuição de Iluminação Pública)

### ⚡ Conversor Watts → kWh
- Converta a potência de qualquer aparelho (W) para consumo (kWh)
- Calcule consumo diário e mensal
- Fórmula transparente: `(W × h/dia × dias/mês) / 1000`

### ⚙️ Configuração de Tarifas
- **TUSD** (Tarifa de Uso do Sistema de Distribuição)
- **TE** (Tarifa de Energia)
- **Bandeiras Tarifárias** (Verde, Amarela, Vermelha P1 e P2)
- **Impostos editáveis** (ICMS e PIS/COFINS)
- **CIP** (Valor fixo municipal)
- Cálculo automático do custo unitário (R$/kWh)

### 💾 Importação/Exportação de Dados
- Baixe um **template JSON** de exemplo
- **Carregue** suas configurações salvas
- **Exporte** seus dados atuais para backup

### 📚 Guia de Uso
- Instruções detalhadas para extrair valores da fatura
- Explicação sobre a estrutura do arquivo JSON
- Tabela explicativa sobre as bandeiras tarifárias

## 📁 Estrutura do Projeto

```
calculadora-energia/
├── index.html          # Estrutura HTML principal
├── styles.css          # Estilos CSS customizados
├── script.js           # Lógica JavaScript
├── README.md           # Documentação do projeto
├── LICENSE             # Licença MIT
└── .gitignore          # Arquivos ignorados pelo Git
```

## 🚀 Como Usar

### Acesso Direto
1. Clone ou baixe o repositório
2. Abra o arquivo `index.html` diretamente no seu navegador (Chrome, Firefox, Edge, etc.)
3. Não precisa de servidor ou instalação!

### Clone o Repositório
```bash
git clone https://github.com/seu-usuario/calculadora-energia.git
cd calculadora-energia
```

Depois, abra o arquivo `index.html` no navegador.

## 📊 Estrutura dos Dados (JSON)

### Exemplo de Arquivo JSON

```json
{
  "tarifas": {
    "tusd_base": 0.56068,
    "te_base": 0.37950,
    "bandeira": "Vermelha P2",
    "cip_value": 15.93,
    "icms_rate": 18,
    "pis_cofins_rate": 5.96
  },
  "aparelhos": [
    {
      "nome": "Geladeira",
      "kwh_dia": 1.5,
      "dias_mes": 30
    },
    {
      "nome": "Ar Condicionado",
      "kwh_dia": 3.0,
      "dias_mes": 20
    }
  ]
}
```

### Campos das Tarifas
- **tusd_base**: Tarifa de Uso do Sistema de Distribuição (R$/kWh)
- **te_base**: Tarifa de Energia (R$/kWh)
- **bandeira**: Nome da bandeira tarifária ("Verde", "Amarela", "Vermelha P1", "Vermelha P2")
- **cip_value**: Contribuição de Iluminação Pública (R$ fixo)
- **icms_rate**: Alíquota do ICMS (%)
- **pis_cofins_rate**: Alíquota combinada de PIS/COFINS (%)

### Campos dos Aparelhos
- **nome**: Nome descritivo do aparelho
- **kwh_dia**: Consumo diário em kWh
- **dias_mes**: Número de dias de uso no mês

## 🎨 Tecnologias Utilizadas

- **HTML5**: Estrutura da aplicação
- **CSS3**: Estilos personalizados
- **JavaScript Vanilla**: Lógica e cálculos
- **Bootstrap 5.3**: Framework CSS para interface responsiva
- **Google Fonts (Inter)**: Tipografia moderna

## 📱 Responsividade

A aplicação é totalmente responsiva e funciona perfeitamente em:
- 💻 Desktop
- 📱 Tablets
- 📱 Smartphones

## 🔍 Como Extrair Valores da Sua Fatura

1. Localize a seção **"Descrição do Faturamento"** na sua conta
2. Encontre a coluna **"Preço Unit. (R$/kWh)"**
3. Procure pelas linhas:
   - **TUSD**: USO SIST. DISTR. (TUSD)
   - **TE**: ENERGIA (TE)
   - **Bandeira**: ADIC BANDEIRA [Cor]
   - **ICMS**: Alíquota na coluna correspondente
   - **PIS/COFINS**: Alíquota combinada
   - **CIP**: Valor fixo da sua cidade

## 🎯 Bandeiras Tarifárias (ENEL-SP)

| Bandeira | Condição | Acréscimo |
|----------|----------|-----------|
| 🟢 Verde | Condições favoráveis | R$ 0,00 |
| 🟡 Amarela | Geração menos favorável | R$ 0,01885/kWh |
| 🔴 Vermelha P1 | Geração custosa | R$ 0,04463/kWh |
| 🔴 Vermelha P2 | Geração muito custosa | R$ 0,07877/kWh |

*Valores de referência - Consulte sua fatura para valores atualizados.*

## 📝 Exemplos de Uso

### Calcular Consumo de um Chuveiro Elétrico
1. Vá na aba **"2. Conversor Watts → kWh"**
2. Digite a potência: **5500 W**
3. Horas de uso por dia: **0.5** (30 minutos)
4. Dias de uso: **30**
5. Veja o resultado: **82,5 kWh/mês**

### Adicionar Aparelhos na Calculadora
1. Na aba **"1. Calculadora de Aparelhos"**
2. Clique em **"Adicionar Aparelho"**
3. Preencha: Nome, Consumo (kWh/dia), Dias/Mês
4. O cálculo é feito automaticamente!

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para:
1. Fazer um Fork do projeto
2. Criar uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abrir um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📧 Contato

Para dúvidas, sugestões ou reportar problemas, abra uma [Issue](https://github.com/seu-usuario/calculadora-energia/issues) no repositório.

---

⚡ Desenvolvido para ajudar você a entender e controlar melhor seus gastos com energia elétrica!
