"use client";

import { useState } from "react";
import { db } from "@/lib/firebase/config";
import { doc, writeBatch } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

// Detailed educational content mapping to Ugandan UNEB standard.
// Handcrafted real subjects, topics, and lessons instead of basic templates or lorem ipsum.
const SEED_DATA = {
  subjects: [
    {
      id: "biology",
      name: "Biology",
      level: "O-Level",
      description: "Comprehensive UNEB Biology covering cell biology, plant life processes, human physiology, and ecology.",
      accentColor: "#10B981", // Emerald green represent biology
      totalTopics: 3,
      isActive: true,
    },
    {
      id: "chemistry",
      name: "Chemistry",
      level: "O-Level",
      description: "Uganda O-Level chemistry syllabus including atomic structures, chemical bonding, acids, bases, and organic chemistry.",
      accentColor: "#8B5CF6", // Purple/indigo styling for chemistry
      totalTopics: 3,
      isActive: true,
    },
    {
      id: "mathematics",
      name: "Mathematics",
      level: "O-Level",
      description: "Core UNEB Mathematics coverage from indices and algebra to coordinate geometry, trigonometry, and statistics.",
      accentColor: "#3B82F6", // Professional vibrant blue for maths
      totalTopics: 3,
      isActive: true,
    },
  ],
  topics: [
    // BIOLOGY TOPICS
    {
      id: "cell-biology",
      subjectId: "biology",
      title: "Cell Biology & Organization",
      description: "Detailed analysis of plant and animal cell structures, organelles, specialized cells, and levels of organization.",
      order: 1,
      totalLessons: 2,
      estimatedHours: 4,
      isActive: true,
    },
    {
      id: "photosynthesis",
      subjectId: "biology",
      title: "Nutrition in Plants (Photosynthesis)",
      description: "Understanding chloroplast structure, light and dark reactions, limiting factors, and leaf adaptations.",
      order: 2,
      totalLessons: 2,
      estimatedHours: 5,
      isActive: true,
    },
    {
      id: "ecology",
      subjectId: "biology",
      title: "Ecology & Ecosystems",
      description: "Energy flows, food webs, ecological pyramids, nutrient cycles, and human impacts on environments.",
      order: 3,
      totalLessons: 2,
      estimatedHours: 5,
      isActive: true,
    },
    // CHEMISTRY TOPICS
    {
      id: "chemical-bonding",
      subjectId: "chemistry",
      title: "Atomic Structure & Chemical Bonding",
      description: "Structure of atoms, valency, electronic configurations, and the mechanics of ionic, covalent, and metallic bonds.",
      order: 1,
      totalLessons: 2,
      estimatedHours: 4,
      isActive: true,
    },
    {
      id: "acids-bases",
      subjectId: "chemistry",
      title: "Acids, Bases, and Salts",
      description: "Properties of acids and alkalis, pH scales, indicator reactions, neutralization, and preparation of salts.",
      order: 2,
      totalLessons: 2,
      estimatedHours: 5,
      isActive: true,
    },
    {
      id: "organic-chemistry",
      subjectId: "chemistry",
      title: "Introduction to Organic Chemistry",
      description: "Hydrocarbons, homologous series, naming alkanes/alkenes, cracking, properties, and polymer polymerization.",
      order: 3,
      totalLessons: 2,
      estimatedHours: 6,
      isActive: true,
    },
    // MATHEMATICS TOPICS
    {
      id: "algebra-basics",
      subjectId: "mathematics",
      title: "Algebraic Simplifications & Quadratics",
      description: "Linear expansions, factorizing quadratic expressions, solving equations, and quadratic formula application.",
      order: 1,
      totalLessons: 2,
      estimatedHours: 4,
      isActive: true,
    },
    {
      id: "trigonometry",
      subjectId: "mathematics",
      title: "Trigonometric Ratios & Right-angled Triangles",
      description: "Defining sine, cosine, and tangent. Sine and Cosine rules, applications to angles of elevation and depression.",
      order: 2,
      totalLessons: 2,
      estimatedHours: 5,
      isActive: true,
    },
    {
      id: "statistics-basics",
      subjectId: "mathematics",
      title: "Elementary Statistics & Data Representation",
      description: "Calculating mean, median, mode for grouped/ungrouped data, cumulative frequency curves (ogives), and histograms.",
      order: 3,
      totalLessons: 2,
      estimatedHours: 5,
      isActive: true,
    },
  ],
  lessons: [
    // BIOLOGY LESSONS
    {
      id: "intro-to-cells",
      subjectId: "biology",
      topicId: "cell-biology",
      title: "Cell Structures & Organelles",
      order: 1,
      estimatedMinutes: 20,
      passingScore: 75,
      isActive: true,
      blocks: [
        { type: "text", heading: "The Basic Unit of Life", content: "All living organisms are composed of cells. A cell is the smallest unit of life that can carry out all vital biological processes. Cell components are called organelles, each performing specific tasks to keep the cell alive." },
        { type: "key_point", title: "Key Organelles to Memorize", content: "- Nucleus: Controls all cellular activities and houses genetic material (DNA).\n- Mitochondria: The site of aerobic respiration where energy (ATP) is produced.\n- Chloroplast: Found in plant cells; contains chlorophyll to absorb sunlight for photosynthesis.\n- Cell Wall: Rigid cellulose structure providing structural support to plant cells." },
        { type: "worked_example", problem: "State three primary structural differences between a typical plant cell and an animal cell.", steps: ["1. Recognize that plant cells have a rigid cellulose cell wall, whereas animal cells only have a cell membrane.", "2. Recall that plant cells contain chloroplasts for photosynthesis; animal cells do not.", "3. Note that mature plant cells contain a single large central vacuole, while animal cells have small, temporary vacuoles."], answer: "Plant cells contain a cell wall, chloroplasts, and a large central vacuole, which are all absent in typical animal cells." },
        { type: "question", question: "Which cellular organelle is responsible for synthesizing proteins?", options: ["Mitochondria", "Ribosome", "Nucleus", "Vacuole"], correctIndex: 1, explanation: "Ribosomes translate genetic instructions from mRNA to assemble amino acids into proteins." }
      ]
    },
    {
      id: "cell-specialization",
      subjectId: "biology",
      topicId: "cell-biology",
      title: "Cell Specialization & Adaptations",
      order: 2,
      estimatedMinutes: 18,
      passingScore: 75,
      isActive: true,
      blocks: [
        { type: "text", heading: "Adaptation to Functions", content: "Multicellular organisms contain specialized cells that have undergone differentiation. This means they develop specific shapes, sizes, and internal structures optimized to perform a specific function." },
        { type: "key_point", title: "Examples of Specialized Cells", content: "- Red Blood Cells: Biconcave shape and lack of a nucleus maximizes space for carrying Oxygen via hemoglobin.\n- Root Hair Cells: Long extensions provide a large surface area for rapid absorption of water and mineral salts.\n- Sperm Cells: Tail (flagellum) for movement and high count of mitochondria in the mid-piece to supply energy." },
        { type: "question", question: "Why do root hair cells lack chloroplasts?", options: ["They absorb water instead", "They are located underground where there is no light", "They are too small to hold them", "They have thin walls"], correctIndex: 1, explanation: "Chloroplasts absorb light for photosynthesis. Since roots are underground in total darkness, chloroplasts would serve no functional purpose." }
      ]
    },
    {
      id: "photosynthesis-process",
      subjectId: "biology",
      topicId: "photosynthesis",
      title: "The Process of Photosynthesis",
      order: 1,
      estimatedMinutes: 20,
      passingScore: 75,
      isActive: true,
      blocks: [
        { type: "text", heading: "Light Energy Capture", content: "Photosynthesis is the metabolic process by which green plants manufacture organic carbohydrates from carbon dioxide and water using solar energy trapped by chlorophyll." },
        { type: "key_point", title: "The Balanced Chemical Equation", content: "6CO₂ + 6H₂O + [Light Energy] → C₆H₁₂O₆ + 6O₂\n\nCarbon dioxide enters through stomata, and water is absorbed by the roots." },
        { type: "question", question: "What is the primary carbohydrate product stored in plant leaves after photosynthesis?", options: ["Glucose", "Sucrose", "Starch", "Cellulose"], correctIndex: 2, explanation: "Glucose is produced first, but it is quickly converted into insoluble starch for long-term storage within the leaf." }
      ]
    },
    {
      id: "limiting-factors",
      subjectId: "biology",
      topicId: "photosynthesis",
      title: "Limiting Factors of Photosynthesis",
      order: 2,
      estimatedMinutes: 22,
      passingScore: 75,
      isActive: true,
      blocks: [
        { type: "text", heading: "What is a Limiting Factor?", content: "A limiting factor is any environmental factor that is in the shortest supply and thus restricts the rate of a physiological process. For photosynthesis, the primary limiting factors are light intensity, carbon dioxide concentration, and temperature." },
        { type: "key_point", title: "Temperature Effects", content: "Because photosynthesis relies on biochemical enzymes, the rate increases with temperature up to an optimum point (typically around 35-40°C). Beyond this, enzymes denature, and the rate drops abruptly." },
        { type: "question", question: "If light intensity and temperature are optimal, what is most likely limiting photosynthesis on a bright hot afternoon?", options: ["Oxygen concentration", "Water availability", "Carbon dioxide concentration", "Chlorophyll content"], correctIndex: 2, explanation: "Atmospheric CO₂ concentration is relatively low (about 0.04%), making it the most common limiting factor under bright, warm conditions." }
      ]
    },
    {
      id: "ecosystem-intro",
      subjectId: "biology",
      topicId: "ecology",
      title: "Ecosystem Components & Energy Flow",
      order: 1,
      estimatedMinutes: 20,
      passingScore: 75,
      isActive: true,
      blocks: [
        { type: "text", heading: "Biotic and Abiotic Factors", content: "An ecosystem consists of all the living organisms (biotic factors) in a given area interacting with their non-living physical environment (abiotic factors like temperature, soil, and pH)." },
        { type: "key_point", title: "Energy Flow Rules", content: "Energy enters ecosystems via solar radiation, is captured by producers (plants), and moves through consumers. Unlike nutrients, energy does not cycle; it flows one-way and is lost as heat at each trophic level (about 90% loss)." },
        { type: "question", question: "Which organisms occupy the first trophic level in all standard ecosystems?", options: ["Herbivores", "Decomposers", "Primary Producers", "Carnivores"], correctIndex: 2, explanation: "Primary producers (green plants) occupy the first trophic level because they synthesize their own food." }
      ]
    },
    {
      id: "ecological-relationships",
      subjectId: "biology",
      topicId: "ecology",
      title: "Interactions in Ecosystems",
      order: 2,
      estimatedMinutes: 20,
      passingScore: 75,
      isActive: true,
      blocks: [
        { type: "text", heading: "Types of Interdependence", content: "Organisms in an ecosystem interact constantly. These interactions shape community structures and balance populations." },
        { type: "key_point", title: "Definitions", content: "- Mutualism: Both species benefit (e.g., nitrogen-fixing bacteria in root nodules of legumes).\n- Parasitism: One benefits, host is harmed (e.g., ticks on cattle).\n- Commensalism: One benefits, the other is unaffected." },
        { type: "question", question: "What is the relationship between nitrogen-fixing bacteria and leguminous plants?", options: ["Parasitism", "Competition", "Commensalism", "Mutualism"], correctIndex: 3, explanation: "The plant receives nitrates to build proteins, and the bacteria receive carbohydrates and shelter, benefiting both." }
      ]
    },

    // CHEMISTRY LESSONS
    {
      id: "ionic-bonding-details",
      subjectId: "chemistry",
      topicId: "chemical-bonding",
      title: "Ionic Bonding Mechanics",
      order: 1,
      estimatedMinutes: 20,
      passingScore: 75,
      isActive: true,
      blocks: [
        { type: "text", heading: "The Transfer of Electrons", content: "Ionic bonding occurs between metals and non-metals. Metals lose valence electrons to achieve stable octet configurations, becoming positive ions (cations). Non-metals gain these electrons to become negative ions (anions). The strong electrostatic forces of attraction between these oppositely charged ions constitute the ionic bond." },
        { type: "key_point", title: "Common Ionic Properties", content: "- High melting and boiling points due to strong electrostatic attraction throughout the giant lattice.\n- Conduct electricity only when molten or dissolved in water, because ions are then free to migrate." },
        { type: "worked_example", problem: "Explain how Sodium (Na, atomic number 11) and Chlorine (Cl, atomic number 17) combine to form Sodium Chloride.", steps: ["1. Write electronic configurations: Na is 2:8:1, Cl is 2:8:7.", "2. Show electron movement: Sodium atom loses its 1 outer electron to form a stable Na⁺ ion (configuration 2:8).", "3. Show electron gain: Chlorine atom gains this 1 electron to form a stable Cl⁻ chloride ion (configuration 2:8:8).", "4. Conclude: The electrostatic attraction holding Na⁺ and Cl⁻ together forms the ionic crystal lattice."], answer: "Sodium transfers 1 valence electron to chlorine, forming Na⁺ and Cl⁻ ions which attract electrostatically to produce Sodium Chloride." },
        { type: "question", question: "Why do solid ionic compounds fail to conduct electricity?", options: ["They have no electrons", "Their ions are locked in fixed positions in the lattice", "They contain neutral molecules", "They are too dense"], correctIndex: 1, explanation: "In solid state, the ions are held tightly in a rigid structure and cannot move. Once melted or dissolved, the lattice breaks down and ions can freely flow." }
      ]
    },
    {
      id: "covalent-bonding-details",
      subjectId: "chemistry",
      topicId: "chemical-bonding",
      title: "Covalent Bonding & Molecules",
      order: 2,
      estimatedMinutes: 20,
      passingScore: 75,
      isActive: true,
      blocks: [
        { type: "text", heading: "Sharing Electrons", content: "Covalent bonding occurs between non-metal atoms when they share pairs of electrons to achieve stable, full outer energy levels. A single covalent bond is formed by one shared pair of electrons." },
        { type: "key_point", title: "Molecular Structure", content: "Simple molecular structures contain strong covalent bonds within molecules, but very weak intermolecular forces (Van der Waals forces) between different molecules. This results in low melting/boiling points." },
        { type: "question", question: "Which of the following compounds contains covalent bonds?", options: ["NaCl", "MgO", "CO₂", "CaCl₂"], correctIndex: 2, explanation: "Carbon dioxide (CO₂) is made of non-metals sharing electrons, whereas NaCl, MgO, and CaCl₂ are ionic." }
      ]
    },
    {
      id: "acids-properties",
      subjectId: "chemistry",
      topicId: "acids-bases",
      title: "Properties of Acids & Bases",
      order: 1,
      estimatedMinutes: 20,
      passingScore: 75,
      isActive: true,
      blocks: [
        { type: "text", heading: "Definitions of Acids and Bases", content: "An acid is a substance that dissociates in aqueous solution to produce Hydrogen ions (H⁺). A base is a metal oxide or hydroxide that reacts with an acid to form salt and water only. A soluble base is called an alkali, releasing Hydroxide ions (OH⁻)." },
        { type: "key_point", title: "Reaction Patterns", content: "1. Acid + Metal → Salt + Hydrogen Gas\n2. Acid + Carbonate → Salt + Water + Carbon Dioxide\n3. Acid + Base → Salt + Water (Neutralization)" },
        { type: "question", question: "Which gas is evolved when dilute Hydrochloric acid reacts with Calcium Carbonate?", options: ["Hydrogen", "Carbon Dioxide", "Oxygen", "Chlorine"], correctIndex: 1, explanation: "Acids react with carbonates to produce carbon dioxide gas, which turns lime water milky." }
      ]
    },
    {
      id: "salt-preparation",
      subjectId: "chemistry",
      topicId: "acids-bases",
      title: "Preparation of Salts",
      order: 2,
      estimatedMinutes: 22,
      passingScore: 75,
      isActive: true,
      blocks: [
        { type: "text", heading: "Soluble vs Insoluble Salts", content: "The method of preparing a salt depends on its solubility. Soluble salts can be prepared by reacting acids with metals, insoluble bases, or carbonates. Insoluble salts are made by ionic precipitation (mixing two soluble salts)." },
        { type: "key_point", title: "Salt Solubility Rules", content: "- All nitrates are soluble.\n- All sodium, potassium, and ammonium salts are soluble.\n- Most sulfates are soluble except Barium, Lead, and Calcium." },
        { type: "question", question: "Which method is best suited to prepare insoluble Barium Sulfate?", options: ["Reaction of Barium metal with Sulfuric acid", "Titration using Barium Hydroxide", "Precipitation by mixing Barium Nitrate and Sodium Sulfate", "Heating Barium Oxide"], correctIndex: 2, explanation: "Precipitation is used for insoluble salts. Mixing soluble Barium Nitrate and soluble Sodium Sulfate yields insoluble Barium Sulfate precipitate." }
      ]
    },
    {
      id: "organic-hydrocarbons",
      subjectId: "chemistry",
      topicId: "organic-chemistry",
      title: "Homologous Series & Alkanes",
      order: 1,
      estimatedMinutes: 22,
      passingScore: 75,
      isActive: true,
      blocks: [
        { type: "text", heading: "What is a Homologous Series?", content: "A homologous series is a family of organic compounds with the same functional group, similar chemical properties, and a graduation in physical properties. Each member differs from the next by a -CH₂- group." },
        { type: "key_point", title: "Alkanes overview", content: "Alkanes are saturated hydrocarbons with the general formula CnH2n+2. They are saturated because they contain only single carbon-carbon bonds." },
        { type: "question", question: "What is the formula of the third member of the Alkane series (Propane)?", options: ["C₃H₆", "C₃H₈", "C₄H₁₀", "C₂H₆"], correctIndex: 1, explanation: "Using CnH2n+2 with n=3 gives C₃H₈." }
      ]
    },
    {
      id: "organic-alkenes",
      subjectId: "chemistry",
      topicId: "organic-chemistry",
      title: "Alkenes & Unsaturations",
      order: 2,
      estimatedMinutes: 20,
      passingScore: 75,
      isActive: true,
      blocks: [
        { type: "text", heading: "Unsaturated Hydrocarbons", content: "Alkenes are unsaturated hydrocarbons containing at least one carbon-carbon double bond (C=C). Their general formula is CnH2n." },
        { type: "key_point", title: "Testing for Unsaturation", content: "Alkenes rapidly decolorize orange/brown bromine water because they undergo addition reactions across the double bond. Alkanes do not react with bromine water in the dark." },
        { type: "question", question: "Which reagent is used to distinguish between ethane and ethene?", options: ["Lime water", "Bromine water", "Acidified potassium manganate", "Copper sulfate"], correctIndex: 1, explanation: "Bromine water turns colorless in contact with unsaturated ethene, but remains orange with saturated ethane." }
      ]
    },

    // MATHEMATICS LESSONS
    {
      id: "quadratics-factoring",
      subjectId: "mathematics",
      topicId: "algebra-basics",
      title: "Factoring Quadratic Expressions",
      order: 1,
      estimatedMinutes: 20,
      passingScore: 75,
      isActive: true,
      blocks: [
        { type: "text", heading: "Quadratic Trinomials", content: "A quadratic expression takes the form ax² + bx + c, where a, b, and c are constants. Factorizing involves rewriting it as a product of two linear binomial brackets." },
        { type: "key_point", title: "Splitting the Middle Term", content: "To factor x² + px + q:\nFind two numbers that multiply to q and add up to p. For example, in x² + 5x + 6, the numbers are 2 and 3, yielding (x + 2)(x + 3)." },
        { type: "worked_example", problem: "Factorize the quadratic expression x² - 7x + 12.", steps: ["1. Identify the constant product needed: +12.", "2. Identify the sum needed: -7.", "3. List factor pairs of 12 that add to -7: -3 and -4 multiply to +12 and add to -7.", "4. Write the expression in factorized form: (x - 3)(x - 4)."], answer: "(x - 3)(x - 4)" },
        { type: "question", question: "Factorize completely: x² - 9", options: ["(x - 3)(x - 3)", "(x - 9)(x + 1)", "(x - 3)(x + 3)", "(x - 4.5)(x + 4.5)"], correctIndex: 2, explanation: "This is a difference of two squares: a² - b² = (a - b)(a + b). Since 9 = 3², the expression simplifies to (x - 3)(x + 3)." }
      ]
    },
    {
      id: "quadratics-formula",
      subjectId: "mathematics",
      topicId: "algebra-basics",
      title: "The Quadratic Formula",
      order: 2,
      estimatedMinutes: 22,
      passingScore: 75,
      isActive: true,
      blocks: [
        { type: "text", heading: "Finding the Roots", content: "When a quadratic equation ax² + bx + c = 0 cannot be easily factorized, we apply the general quadratic formula to determine its roots." },
        { type: "key_point", title: "The Formula", content: "x = [-b ± √(b² - 4ac)] / [2a]\n\nThe term b² - 4ac is called the discriminant. If it is negative, there are no real roots." },
        { type: "question", question: "Solve x² - 5x + 6 = 0 using the quadratic formula.", options: ["x = 1 or x = 6", "x = -2 or x = -3", "x = 2 or x = 3", "x = -1 or x = 5"], correctIndex: 2, explanation: "Using a=1, b=-5, c=6: discriminant is (-5)² - 4(1)(6) = 25 - 24 = 1. Roots are [5 ± 1]/2, resulting in 3 and 2." }
      ]
    },
    {
      id: "trig-ratios",
      subjectId: "mathematics",
      topicId: "trigonometry",
      title: "SOH-CAH-TOA in Practice",
      order: 1,
      estimatedMinutes: 20,
      passingScore: 75,
      isActive: true,
      blocks: [
        { type: "text", heading: "Right-Angled Relationships", content: "Trigonometric ratios relate the angles of a right-angled triangle to the lengths of its sides. The hypotenuse is always opposite the 90° angle. The opposite and adjacent sides are determined relative to the reference angle θ." },
        { type: "key_point", title: "Primary Ratios", content: "- Sine (sin θ) = Opposite / Hypotenuse\n- Cosine (cos θ) = Adjacent / Hypotenuse\n- Tangent (tan θ) = Opposite / Adjacent" },
        { type: "question", question: "In a right-angled triangle, if the side opposite to angle A is 3cm and the adjacent side is 4cm, what is the tangent of angle A?", options: ["0.6", "0.8", "0.75", "1.33"], correctIndex: 2, explanation: "tan A = opposite/adjacent = 3/4 = 0.75." }
      ]
    },
    {
      id: "elevation-depression",
      subjectId: "mathematics",
      topicId: "trigonometry",
      title: "Angles of Elevation & Depression",
      order: 2,
      estimatedMinutes: 20,
      passingScore: 75,
      isActive: true,
      blocks: [
        { type: "text", heading: "Real-world Applications", content: "Angles of elevation and depression are measured relative to the horizontal line of sight. An angle of elevation looks upwards, while an angle of depression looks downwards." },
        { type: "key_point", title: "Equivalence rule", content: "The angle of elevation from object A to object B is always equal to the angle of depression from object B to object A because they form alternate interior angles between parallel horizontal lines." },
        { type: "question", question: "A student stands 10m away from the foot of a tree. The angle of elevation to the top of the tree is 45°. How tall is the tree?", options: ["5m", "10m", "7.07m", "14.14m"], correctIndex: 1, explanation: "tan(45°) = height / 10. Since tan(45°) = 1, height = 10 * 1 = 10m." }
      ]
    },
    {
      id: "grouped-data-mean",
      subjectId: "mathematics",
      topicId: "statistics-basics",
      title: "Mean for Grouped Data",
      order: 1,
      estimatedMinutes: 22,
      passingScore: 75,
      isActive: true,
      blocks: [
        { type: "text", heading: "Frequency Distributions", content: "For large datasets, numbers are grouped into classes (e.g., 10-19, 20-29). Calculating the mean requires finding the midpoint of each class range to serve as an estimate for that group." },
        { type: "key_point", title: "Calculating Formula", content: "Mean = Σ(f * x) / Σf\n\nWhere f is the class frequency and x is the midpoint of the class interval." },
        { type: "question", question: "What is the midpoint of the class interval 10 - 20?", options: ["10", "20", "15", "15.5"], correctIndex: 2, explanation: "Midpoint = (Lower limit + Upper limit) / 2 = (10 + 20) / 2 = 15." }
      ]
    },
    {
      id: "statistics-ogives",
      subjectId: "mathematics",
      topicId: "statistics-basics",
      title: "Cumulative Frequency & Ogives",
      order: 2,
      estimatedMinutes: 20,
      passingScore: 75,
      isActive: true,
      blocks: [
        { type: "text", heading: "Plotting Cumulative Data", content: "A cumulative frequency curve, or ogive, shows the running total of frequencies up to the upper boundary of each class. It is useful for estimating percentiles and the median." },
        { type: "key_point", title: "Median from Ogive", content: "To estimate the median, find the value on the horizontal axis corresponding to N/2 (50% of total frequency) on the vertical axis." },
        { type: "question", question: "If the total frequency in a statistics class is 80, at what cumulative frequency value do we find the median on the ogive?", options: ["20", "40", "60", "50"], correctIndex: 1, explanation: "The median corresponds to 50% of the total frequency, which is N/2 = 80 / 2 = 40." }
      ]
    }
  ],
  questions: [
    {
      id: "q-bio-1",
      subjectId: "biology",
      topicId: "cell-biology",
      text: "Explain how a root hair cell is adapted to water absorption.",
      marks: 4,
      markingScheme: "1. Has a long projection/extension (1 mark) which increases surface area (1 mark).\n2. Large central vacuole to maintain water potential gradient (1 mark).\n3. Abundant mitochondria to provide energy for active transport of minerals (1 mark).",
      requiredKeywords: ["projection", "surface area", "vacuole", "mitochondria", "active transport"],
    },
    {
      id: "q-chem-1",
      subjectId: "chemistry",
      topicId: "chemical-bonding",
      text: "Compare ionic and covalent compounds in terms of melting point and electrical conductivity.",
      marks: 6,
      markingScheme: "1. Ionic compounds have high melting points due to strong electrostatic attraction (1 mark). They conduct electricity when molten/aqueous due to mobile ions (1 mark).\n2. Covalent compounds have low melting points due to weak intermolecular forces (1 mark) and do not conduct electricity because they lack free electrons/ions (1 mark).",
      requiredKeywords: ["melting point", "electrostatic", "intermolecular", "conduct", "ions"],
    },
    {
      id: "q-math-1",
      subjectId: "mathematics",
      topicId: "algebra-basics",
      text: "Explain the steps involved in factorizing the quadratic expression 2x² + 7x + 3.",
      marks: 4,
      markingScheme: "1. Find two numbers that multiply to (2 * 3 = 6) and add to 7. These are 6 and 1 (1 mark).\n2. Rewrite the expression: 2x² + 6x + x + 3 (1 mark).\n3. Factor by grouping: 2x(x + 3) + 1(x + 3) (1 mark).\n4. Simplify to (2x + 1)(x + 3) (1 mark).",
      requiredKeywords: ["multiply", "add", "grouping", "factors"],
    },
  ],
  markingSchemes: [
    {
      id: "cell-biology",
      subjectId: "biology",
      topicId: "cell-biology",
      generalGuidance: "Reward clear descriptions of cellular features and their adaptation to functions.",
      keyTerms: ["adaptation", "surface area", "mitochondria", "vacuole"],
      commonMistakes: ["Stating plant cells have a cell membrane instead of a cell wall", "Confusing mitochondria with chloroplasts"],
    },
    {
      id: "chemical-bonding",
      subjectId: "chemistry",
      topicId: "chemical-bonding",
      generalGuidance: "Clearly distinguish between electrostatic forces in ionic bonding and shared electron pairs in covalent bonding.",
      keyTerms: ["electrostatic", "lattice", "electrons", "sharing", "intermolecular"],
      commonMistakes: ["Saying covalent compounds conduct electricity", "Forgetting that ionic crystals have high melting points"],
    },
    {
      id: "algebra-basics",
      subjectId: "mathematics",
      topicId: "algebra-basics",
      generalGuidance: "Check intermediate steps showing middle term factorization carefully.",
      keyTerms: ["trinomial", "coefficients", "discriminant", "roots"],
      commonMistakes: ["Forgetting signs when factoring", "Incorrectly combining linear terms"],
    },
  ]
};

export default function SeedPage() {
  const router = useRouter();
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSeed = async () => {
    setLoading(true);
    setError(null);
    setStatus("Initiating database seeding...");

    try {
      // We use Firestore write batches for atomic write operations.
      // Firestore batches support up to 500 writes, which easily covers our content size.
      const batch = writeBatch(db);

      // 1. Queue Subject updates
      setStatus("Preparing Subjects collection...");
      for (const subject of SEED_DATA.subjects) {
        const docRef = doc(db, "subjects", subject.id);
        batch.set(docRef, subject);
      }

      // 2. Queue Topic updates
      setStatus("Preparing Topics collection...");
      for (const topic of SEED_DATA.topics) {
        const docRef = doc(db, "topics", topic.id);
        batch.set(docRef, topic);
      }

      // 3. Queue Lesson updates
      setStatus("Preparing Lessons collection...");
      for (const lesson of SEED_DATA.lessons) {
        const docRef = doc(db, "lessons", lesson.id);
        batch.set(docRef, lesson);
      }

      // 4. Queue Questions updates
      setStatus("Preparing Questions collection...");
      for (const question of SEED_DATA.questions) {
        const docRef = doc(db, "questions", question.id);
        batch.set(docRef, question);
      }

      // 5. Queue Marking Schemes updates
      setStatus("Preparing Marking Schemes collection...");
      for (const scheme of SEED_DATA.markingSchemes) {
        const docRef = doc(db, "markingSchemes", scheme.id);
        batch.set(docRef, scheme);
      }

      setStatus("Writing content to Firestore...");
      await batch.commit();

      setStatus("Database seeded successfully with authentic UNEB sample content!");
      setLoading(false);
    } catch (err: unknown) {
      console.error("Failed to seed database:", err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-violet-50 p-6">
      <div className="w-full max-w-lg bg-white/80 backdrop-blur-md border border-slate-100 rounded-3xl p-8 shadow-2xl shadow-indigo-100/50">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-600 mb-4">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
            </svg>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-800">SomaEdu Database Seeder</h1>
          <p className="text-sm text-slate-500 mt-2">
            Populate your Firebase database with authentic, premium Uganda O-Level curriculum content (Biology, Chemistry, Mathematics).
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 border border-red-100 rounded-2xl p-4 mb-6 text-sm flex items-start gap-3">
            <svg className="w-5 h-5 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <span className="font-bold">Seeding Error:</span>
              <p className="mt-1 font-mono text-xs">{error}</p>
            </div>
          </div>
        )}

        {status && (
          <div className="bg-indigo-50/50 text-indigo-700 border border-indigo-100/30 rounded-2xl p-4 mb-6 text-sm flex items-center gap-3">
            <div className="flex gap-1 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping"></span>
            </div>
            <p className="font-medium">{status}</p>
          </div>
        )}

        <div className="space-y-4">
          <button
            onClick={handleSeed}
            disabled={loading}
            className="w-full h-14 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-2xl shadow-lg shadow-slate-900/10 hover:shadow-slate-900/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:pointer-events-none"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Processing...</span>
              </>
            ) : (
              <span>Begin Content Import</span>
            )}
          </button>

          <button
            onClick={() => router.push("/login")}
            className="w-full h-14 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-2xl active:scale-[0.98] transition-all"
          >
            Return to Login
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100 text-center text-xs text-slate-400">
          Uses transaction writes to ensure zero partial database issues.
        </div>
      </div>
    </div>
  );
}
