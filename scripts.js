let nodes = [];
let links = [];
let nodeState = {};  // store each node's state (susceptible, infected, recovered)
const width = 600;
const height = 600;

function generateGraph(populationSize) {
  // Create nodes
  nodes = Array.from({ length: populationSize }, (_, i) => ({ id: i }));
  // Randomly create links between nodes to simulate random connections
  links = [];
  for (let i = 0; i < populationSize; i++) {
    const numLinks = Math.floor(Math.random() * 5);
    for (let j = 0; j < numLinks; j++) {
      const target = Math.floor(Math.random() * populationSize);
      if (i !== target) {
        links.push({ source: i, target: target });
      }
    }
  }
}

function drawGraph() {
  const svg = d3.select("svg");

  svg.selectAll("*").remove();  // Clear the previous graph

  const simulation = d3.forceSimulation(nodes)
    .force("link", d3.forceLink(links).id(d => d.id).distance(50))
    .force("charge", d3.forceManyBody().strength(-100))
    .force("center", d3.forceCenter(width / 2, height / 2));

  const link = svg.append("g")
    .attr("stroke", "#999")
    .attr("stroke-opacity", 0.6)
    .selectAll("line")
    .data(links)
    .enter().append("line")
    .attr("stroke-width", 1.5);

  const node = svg.append("g")
    .attr("stroke", "#fff")
    .attr("stroke-width", 1.5)
    .selectAll("circle")
    .data(nodes)
    .enter().append("circle")
    .attr("r", 8)
    .attr("class", d => nodeState[d.id] || "susceptible")
    .call(d3.drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended));

  simulation.on("tick", () => {
    link
      .attr("x1", d => d.source.x)
      .attr("y1", d => d.source.y)
      .attr("x2", d => d.target.x)
      .attr("y2", d => d.target.y);

    node
      .attr("cx", d => d.x)
      .attr("cy", d => d.y)
      .attr("class", d => nodeState[d.id] || "susceptible");
  });

  function dragstarted(event, d) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  function dragged(event, d) {
    d.fx = event.x;
    d.fy = event.y;
  }

  function dragended(event, d) {
    if (!event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }
}

function startSimulation() {
  const populationSize = +document.getElementById("populationSize").value;
  const initialInfected = +document.getElementById("initialInfected").value;
  const R0 = +document.getElementById("R0").value;
  const recoveryRate = +document.getElementById("recoveryRate").value;
  const isolationRate = +document.getElementById("isolationRate").value;
  const vaccinationRate = +document.getElementById("vaccinationRate").value;
  const vaccineEfficacy = +document.getElementById("vaccineEfficacy").value;
  const days = +document.getElementById("days").value;

  // Reset node states
  nodeState = {};
  generateGraph(populationSize);

  // Infect initial nodes
  const initialInfectedNodes = d3.shuffle(nodes).slice(0, initialInfected);
  initialInfectedNodes.forEach(node => nodeState[node.id] = 'infected');

  // Start simulation over days
  for (let day = 0; day < days; day++) {
    let newInfected = [];
    nodes.forEach(node => {
      if (nodeState[node.id] === 'infected') {
        links.forEach(link => {
          const target = (link.source.id === node.id) ? link.target.id : link.source.id;
          if (nodeState[target] === 'susceptible') {
            const infectionProbability = (Math.random() < R0 / 10) ? true : false;
            if (infectionProbability) {
              newInfected.push(target);
            }
          }
        });
      }
    });

    // Infect new nodes
    newInfected.forEach(id => nodeState[id] = 'infected');

    // Recover nodes based on recovery rate
    Object.keys(nodeState).forEach(id => {
      if (nodeState[id] === 'infected' && Math.random() < recoveryRate) {
        nodeState[id] = 'recovered';
      }
    });
  }

  // Redraw the graph with updated states
  drawGraph();
}

generateGraph(100);  // Default population size
drawGraph();
