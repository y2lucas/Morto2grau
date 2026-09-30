// Inicializar ícones Lucide
lucide.createIcons();

// Elementos do DOM
const inputA = document.getElementById('inputA');
const rangeA = document.getElementById('rangeA');
const inputB = document.getElementById('inputB');
const rangeB = document.getElementById('rangeB');
const inputC = document.getElementById('inputC');
const rangeC = document.getElementById('rangeC');
const alertA = document.getElementById('alertA');
const btnReset = document.getElementById('btnReset');

const customX = document.getElementById('customX');
const textYVal = document.getElementById('textYVal');
const calcStepsX = document.getElementById('calcStepsX');

const mathEquation = document.getElementById('mathEquation');
const deltaValue = document.getElementById('deltaValue');
const deltaDesc = document.getElementById('deltaDesc');
const vertexValue = document.getElementById('vertexValue');
const vertexDesc = document.getElementById('vertexDesc');
const yInterceptValue = document.getElementById('yInterceptValue');
const stepDelta = document.getElementById('stepDelta');
const stepRoots = document.getElementById('stepRoots');

let chart = null;

// Sincronizar Sliders e Inputs
function bindPair(input, range) {
    input.addEventListener('input', () => {
        range.value = input.value;
        updateApp();
    });
    range.addEventListener('input', () => {
        input.value = range.value;
        updateApp();
    });
}

bindPair(inputA, rangeA);
bindPair(inputB, rangeB);
bindPair(inputC, rangeC);

customX.addEventListener('input', updateApp);

btnReset.addEventListener('click', () => {
    inputA.value = 1; rangeA.value = 1;
    inputB.value = -2; rangeB.value = -2;
    inputC.value = -3; rangeC.value = -3;
    customX.value = 2;
    updateApp();
});

// Função Principal de Atualização
function updateApp() {
    let a = parseFloat(inputA.value) || 0;
    let b = parseFloat(inputB.value) || 0;
    let c = parseFloat(inputC.value) || 0;
    let xUser = parseFloat(customX.value) || 0;

    // Alerta se a = 0
    if (a === 0) {
        alertA.classList.remove('hidden');
    } else {
        alertA.classList.add('hidden');
    }

    // Atualizar Equação LaTeX
    let eqString = `$$f(x) = ${formatTerm(a, 'x^2', true)} ${formatTerm(b, 'x')} ${formatTerm(c, '', false, true)}$$`;
    mathEquation.innerHTML = eqString;

    // Cálculo do Ponto Personalizado X -> Y
    let yUser = a * Math.pow(xUser, 2) + b * xUser + c;
    textYVal.innerText = yUser.toFixed(2);
    calcStepsX.innerHTML = `f(${xUser}) = ${a}(${xUser})² + (${b})(${xUser}) + (${c}) = <strong>${yUser.toFixed(2)}</strong>`;

    // Cálculo do Delta
    let delta = (b * b) - (4 * a * c);
    deltaValue.innerText = delta.toFixed(2);

    // Coordenadas do Vértice
    let xv = a !== 0 ? -b / (2 * a) : 0;
    let yv = a !== 0 ? -delta / (4 * a) : c;
    vertexValue.innerText = `(${xv.toFixed(2)}, ${yv.toFixed(2)})`;
    
    if (a > 0) {
        vertexDesc.innerText = "Ponto de Mínimo (parábola voltada para cima)";
    } else if (a < 0) {
        vertexDesc.innerText = "Ponto de Máximo (parábola voltada para baixo)";
    } else {
        vertexDesc.innerText = "Linha Reta (não possui vértice)";
    }

    yInterceptValue.innerText = `(0, ${c.toFixed(2)})`;

    // Detalhes do Delta e Raízes
    let x1 = null, x2 = null;
    if (a !== 0) {
        if (delta > 0) {
            x1 = (-b + Math.sqrt(delta)) / (2 * a);
            x2 = (-b - Math.sqrt(delta)) / (2 * a);
            deltaDesc.innerText = "Δ > 0: Possui 2 raízes reais distintas.";
            stepRoots.innerHTML = `$$x_1 = ${x1.toFixed(2)} \\quad | \\quad x_2 = ${x2.toFixed(2)}$$`;
        } else if (delta === 0) {
            x1 = -b / (2 * a);
            deltaDesc.innerText = "Δ = 0: Possui 1 raiz real dupla.";
            stepRoots.innerHTML = `$$x_1 = x_2 = ${x1.toFixed(2)}$$`;
        } else {
            deltaDesc.innerText = "Δ < 0: Não possui raízes reais.";
            stepRoots.innerHTML = `<span class="text-amber-400 text-xs">Sem raízes reais (Δ < 0)</span>`;
        }
    } else {
        deltaDesc.innerText = "Função do 1º Grau (Reta)";
        let xReta = b !== 0 ? -c / b : null;
        stepRoots.innerHTML = xReta !== null ? `$$x = ${xReta.toFixed(2)}$$` : `Sem raiz`;
    }

    stepDelta.innerHTML = `$$\\Delta = (${b})^2 - 4(${a})(${c}) = ${delta.toFixed(2)}$$`;

    // Re-renderizar LaTeX com MathJax
    if (window.MathJax) {
        MathJax.typesetPromise([mathEquation, stepDelta, stepRoots]);
    }

    // Atualizar o Gráfico Chart.js
    renderChart(a, b, c, xv, yv, x1, x2, xUser, yUser);
}

// Formatação de termos para TeX
function formatTerm(val, symbol, isFirst = false, isConst = false) {
    if (val === 0 && !isConst) return '';
    let sign = val > 0 ? (isFirst ? '' : '+ ') : '- ';
    let absVal = Math.abs(val);
    
    if (isConst) {
        if (val === 0 && !isFirst) return '';
        return `${sign}${absVal}`;
    }

    let numStr = absVal === 1 ? '' : absVal;
    return `${sign}${numStr}${symbol}`;
}

// Renderização do Gráfico no Chart.js
function renderChart(a, b, c, xv, yv, x1, x2, xUser, yUser) {
    let minX = -10;
    let maxX = 10;

    if (xv) {
        minX = Math.min(-10, Math.floor(xv - 6));
        maxX = Math.max(10, Math.ceil(xv + 6));
    }

    const pointsCount = 150;
    const step = (maxX - minX) / pointsCount;
    
    let curveData = [];
    for (let x = minX; x <= maxX; x += step) {
        let y = a * x * x + b * x + c;
        curveData.push({ x: parseFloat(x.toFixed(2)), y: parseFloat(y.toFixed(2)) });
    }

    let specialPoints = [];

    if (x1 !== null) specialPoints.push({ x: parseFloat(x1.toFixed(2)), y: 0, label: `Raiz x1 (${x1.toFixed(2)})`, color: '#34d399' });
    if (x2 !== null && parseFloat(deltaValue.innerText) > 0) specialPoints.push({ x: parseFloat(x2.toFixed(2)), y: 0, label: `Raiz x2 (${x2.toFixed(2)})`, color: '#34d399' });

    if (a !== 0) specialPoints.push({ x: parseFloat(xv.toFixed(2)), y: parseFloat(yv.toFixed(2)), label: `Vértice (${xv.toFixed(2)}, ${yv.toFixed(2)})`, color: '#f87171' });

    specialPoints.push({ x: parseFloat(xUser.toFixed(2)), y: parseFloat(yUser.toFixed(2)), label: `Ponto X (${xUser}, ${yUser.toFixed(2)})`, color: '#c084fc' });

    const ctx = document.getElementById('parabolaChart').getContext('2d');

    if (chart) {
        chart.destroy();
    }

    chart = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [
                {
                    label: 'f(x)',
                    data: curveData,
                    showLine: true,
                    borderColor: '#6366f1',
                    borderWidth: 3,
                    pointRadius: 0,
                    tension: 0.3
                },
                {
                    label: 'Pontos Notáveis',
                    data: specialPoints.map(p => ({ x: p.x, y: p.y })),
                    backgroundColor: specialPoints.map(p => p.color),
                    pointRadius: 6,
                    pointHoverRadius: 8
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: { duration: 300 },
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            if (context.datasetIndex === 1) {
                                let p = specialPoints[context.dataIndex];
                                return `${p.label}`;
                            }
                            return `(x: ${context.parsed.x}, y: ${context.parsed.y})`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    type: 'linear',
                    position: 'center',
                    grid: { color: 'rgba(255, 255, 255, 0.1)' },
                    ticks: { color: '#94a3b8' }
                },
                y: {
                    type: 'linear',
                    position: 'center',
                    grid: { color: 'rgba(255, 255, 255, 0.1)' },
                    ticks: { color: '#94a3b8' }
                }
            }
        }
    });
}

// Inicializar ao carregar a página
window.addEventListener('DOMContentLoaded', () => {
    updateApp();
});