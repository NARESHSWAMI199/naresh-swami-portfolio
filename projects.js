
async function loadPortfolioData() {
    const projectsGrid = document.getElementById("projectsGrid");
    const impactGrid = document.getElementById("impactGrid");

    try {
        const response = await fetch("./projects.json");

        if (!response.ok) {
            throw new Error(`Unable to load JSON: ${response.status}`);
        }

        const data = await response.json();

        // PROJECTS RENDERING
        if (projectsGrid) {
            projectsGrid.className = "project-grid";

            projectsGrid.innerHTML = data.projects.map((project, index) => `
                <article class="project-card">

                    <div class="project-top">
                        <span class="project-type">
                            ${escapeHTML(project.category)}
                        </span>

                        <span class="project-number">
                            ${String(index + 1).padStart(2, "0")}
                        </span>
                    </div>

                    <!-- <div class="project-art">
                        <span class="project-art-icon">
                            ${getProjectIcon(project.category)}
                        </span>
                    </div> -->

                    <h3>${escapeHTML(project.name)}</h3>

                    <p class="project-company">
                        ${escapeHTML(project.company)}
                    </p>

                    <p class="project-period">
                        ${escapeHTML(project.duration)}
                    </p>

                    <p class="project-description">
                        ${escapeHTML(project.description)}
                    </p>

                    <div class="project-highlights">
                        ${project.responsibilities.map(item => `
                            <p class="project-highlight">
                                <span>↗</span>
                                ${escapeHTML(item)}
                            </p>
                        `).join("")}
                    </div>

                    <div class="tags">
                        ${project.technologies.map(tech => `
                            <span>${escapeHTML(tech)}</span>
                        `).join("")}
                    </div>

                    <div class="project-footer">
                        <span>${escapeHTML(project.projectType)}</span>
                    </div>

                </article>
            `).join("");
            
        }

            
        // IMPACT RENDERING - TIMELINE DESIGN
 
        if (impactGrid) {

            const timelineLine = impactGrid.querySelector(".timeline-line");

            impactGrid.innerHTML = "";

            // Keep existing timeline line
            if (timelineLine) {
                impactGrid.appendChild(timelineLine);
            }

            const whatNext = document.createElement("article");
            whatNext.className = "timeline-item";
            whatNext.innerHTML = `
                <div class="timeline-dot dot-outline"></div>

                <div class="timeline-date">
                    NEXT CHAPTER
                </div>

                <div class="timeline-content next-role">

                    <h3>What's next?</h3>

                    <p>
                        I'm open to opportunities where I can contribute
                        my backend development experience, solve
                        meaningful engineering problems and continue
                        growing as a software engineer.
                    </p>

                    <a href="#contact" class="text-link">
                        Let's connect <span>↗</span>
                    </a>

                </div>`;

            impactGrid.appendChild(whatNext);

            data.impact.forEach((item, index) => {

                const article = document.createElement("article");
                article.className = "timeline-item";

                article.innerHTML = `
                    <div class="timeline-dot"></div>

                    <div class="timeline-date">
                        ${escapeHTML(item.context || item.timeframe || "")}
                    </div>

                    <div class="timeline-content">

                        <div class="timeline-title">
                            <h3>${escapeHTML(item.company)}</h3>

                            <span class="work-type">
                                ${escapeHTML(item.metric)}
                            </span>
                        </div>

                        <h4>${escapeHTML(item.workedAs)}</h4>

                        <p>
                            ${escapeHTML(item.description)}
                        </p>

                        <div class="tags">
                            ${item.technologies.map(tech => `
                                <span>${escapeHTML(tech)}</span>
                            `).join("")}
                        </div>

                    </div>
                `;

             
                impactGrid.appendChild(article);
        
            });

        }
        // About section rendering
        const aboutGrid = document.getElementById("aboutGrid");
        if (aboutGrid) {
            aboutGrid.innerHTML = data.about.map(item => `
                    <div class="about-lead">
                <p>
                    ${escapeHTML(item.lead)}
                </p>
            </div>

            <div class="about-detail">
                ${item.detail.map(detail => `
                    <p>${escapeHTML(detail)}</p>
                `).join("")}

            </div>
            `).join("");
        }

    } catch (error) {
        console.error("Portfolio loading error:", error);

        if (projectsGrid) {
            projectsGrid.innerHTML =
                '<p class="data-error">Unable to load projects.</p>';
        }

        if (impactGrid) {
            impactGrid.innerHTML =
                '<p class="data-error">Unable to load impact data.</p>';
        }
    }
}

function getProjectIcon(category = "") {
    const value = category.toLowerCase();

    if (value.includes("bank")) return "🏦";
    if (value.includes("email")) return "✉️";
    if (value.includes("wallet")) return "💳";
    if (value.includes("financial")) return "📊";
    if (value.includes("human resource")) return "👥";
    if (value.includes("enterprise")) return "⚙️";
    if (value.includes("admin")) return "🖥️";

    return "💻";
}

function escapeHTML(value = "") {
    return String(value).replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}

document.addEventListener("DOMContentLoaded", loadPortfolioData);
