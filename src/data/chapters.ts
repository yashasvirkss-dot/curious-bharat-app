import { Chapter } from '../types';

export const chaptersData: Chapter[] = [
  // ==================== CLASS 9 CHAPTERS ====================
  {
    id: 'c9-cell',
    title: 'The Fundamental Unit of Life: Cell',
    description: 'Explore the structural and functional unit of all living organisms. Understand cellular organelles, membrane transport, and the difference between plant and animal cells.',
    classLevel: 9,
    subject: 'Biology',
    readingTime: '12 mins',
    keyConcepts: ['Prokaryotic vs Eukaryotic Cells', 'Cell Organelles', 'Active & Passive Transport', 'Mitosis & Meiosis'],
    sections: [
      {
        id: 'c9-cell-s1',
        title: '1. Discovery & Cell Theory',
        body: 'Cells were first discovered by Robert Hooke in 1665 while observing a thin slice of cork under a primitive microscope. He noted that it resembled little rooms or "cellula". The Cell Theory, proposed by Schleiden and Schwann, and expanded by Virchow, states that:\n\n• All living organisms are composed of one or more cells.\n• The cell is the basic structural and functional unit of life.\n• All cells arise from pre-existing cells (Omnis cellula-e cellula).',
        keyPoints: [
          'Robert Hooke (1665) - Discovered cells in cork.',
          'Anton van Leeuwenhoek (1674) - Discovered free-living cells in pond water.',
          'Robert Brown (1831) - Discovered the cell nucleus.'
        ],
        diagramType: 'cell'
      },
      {
        id: 'c9-cell-s2',
        title: '2. Plasma Membrane & Cell Wall',
        body: 'The plasma membrane is the outermost covering of the cell that separates its contents from the external environment. It is called a selectively permeable membrane because it permits the entry and exit of some substances while preventing others.\n\n• Diffusion: Movement of gaseous molecules (O₂, CO₂) from high to low concentration.\n• Osmosis: Movement of water molecules through a selectively permeable membrane from high water concentration (dilute solution) to low water concentration (concentrated solution). Plant cells additionally have a rigid outer Cell Wall made of cellulose for structural strength.',
        keyPoints: [
          'Hypotonic Solution: Cell gains water and swells up.',
          'Isotonic Solution: No net movement of water; cell size stays the same.',
          'Hypertonic Solution: Cell loses water and shrinks (Plasmolysis).'
        ]
      },
      {
        id: 'c9-cell-s3',
        title: '3. Cell Organelles: The Powerhouse and Protein Factories',
        body: 'Eukaryotic cells contain specialized internal structures called organelles to perform specific biochemical activities:\n\n• Mitochondria: Known as the "Powerhouse of the cell". They generate energy in the form of ATP (Adenosine Triphosphate) molecules through cellular respiration. Mitochondria have their own DNA and ribosomes.\n• Plastids: Found only in plant cells. Chloroplasts contain chlorophyll for photosynthesis.\n• Endoplasmic Reticulum (ER): RER has ribosomes attached for protein synthesis; SER synthesizes lipids.\n• Lysosomes: Known as "Suicide bags". They contain powerful digestive enzymes to clean up cellular debris. If the cell gets damaged, lysosomes burst and digest their own cell.',
        keyPoints: [
          'Mitochondria and Plastids are semi-autonomous organelles containing their own DNA.',
          'Ribosomes are the sites of protein synthesis.',
          'Golgi Apparatus packages and dispatches materials.'
        ]
      }
    ],
    flashcards: [
      {
        id: 'f-cell-1',
        front: 'Why are lysosomes called the "Suicide Bags" of a cell?',
        back: 'They contain strong digestive enzymes. If a cell is damaged or dies, lysosomes burst, releasing enzymes that digest their own cell.',
        category: 'Biology'
      },
      {
        id: 'f-cell-2',
        front: 'Which organelle is known as the "Powerhouse of the cell" and why?',
        back: 'The Mitochondria. It synthesizes chemical energy for the cell in the form of ATP (Adenosine Triphosphate) during cellular respiration.',
        category: 'Biology'
      },
      {
        id: 'f-cell-3',
        front: 'Define Osmosis.',
        back: 'Osmosis is the passage of water from a region of high water concentration through a selectively permeable membrane to a region of low water concentration.',
        category: 'Biology'
      },
      {
        id: 'f-cell-4',
        front: 'What is Plasmolysis?',
        back: 'When a living plant cell loses water through osmosis, there is shrinkage or contraction of the contents of the cell away from the cell wall.',
        category: 'Biology'
      }
    ],
    quiz: [
      {
        id: 'q-cell-1',
        question: 'Which of the following organelles possesses its own DNA and ribosomes?',
        options: ['Mitochondria', 'Lysosomes', 'Golgi Apparatus', 'Endoplasmic Reticulum'],
        correctAnswerIndex: 0,
        explanation: 'Mitochondria (and Chloroplasts in plants) are semi-autonomous organelles. They contain their own circular DNA and 70S ribosomes, allowing them to synthesize some of their own proteins.'
      },
      {
        id: 'q-cell-2',
        question: 'If a red blood cell is placed in a hypertonic salt solution, what will happen to it?',
        options: ['It will swell and burst', 'It will shrink', 'It will remain unchanged', 'It will turn into a plant cell'],
        correctAnswerIndex: 1,
        explanation: 'A hypertonic solution has a higher solute concentration (lower water concentration) than the inside of the cell. Therefore, water leaves the cell by osmosis, causing it to shrink.'
      },
      {
        id: 'q-cell-3',
        question: 'Which substance makes up the rigid outer cell wall in plant cells?',
        options: ['Lignin', 'Chitin', 'Cellulose', 'Starch'],
        correctAnswerIndex: 2,
        explanation: 'The plant cell wall is composed of Cellulose, a complex carbohydrate that provides mechanical strength and structural integrity to the plants.'
      },
      {
        id: 'q-cell-4',
        question: 'Who proposed the cell theory statement "All cells arise from pre-existing cells"?',
        options: ['Robert Hooke', 'Rudolf Virchow', 'Schleiden and Schwann', 'Robert Brown'],
        correctAnswerIndex: 1,
        explanation: 'Rudolf Virchow in 1855 expanded the cell theory by suggesting "Omnis cellula-e cellula", meaning all cells originate from division of existing cells.'
      }
    ]
  },
  {
    id: 'c9-atoms',
    title: 'Structure of the Atom',
    description: 'Journey inside the atom. Dive into Thomson, Rutherford, and Bohr models. Learn about electron configurations, valency, isotopes, and isobaric nuclei.',
    classLevel: 9,
    subject: 'Chemistry',
    readingTime: '15 mins',
    keyConcepts: ['Subatomic Particles', 'Rutherford Scattering', 'Bohr Model of Atom', 'Valency & Octet Rule'],
    sections: [
      {
        id: 'c9-atoms-s1',
        title: '1. Discovery of Subatomic Particles',
        body: 'Dalton originally claimed that atoms were indivisible. However, the discovery of static electricity and subatomic particles disproved this:\n\n• Cathode Rays (Electrons): Discovered by J.J. Thomson in 1897. Electrons are negatively charged particles with negligible mass.\n• Canal Rays (Protons): Discovered by E. Goldstein in 1886. Protons are positively charged particles with mass approximately 2000 times that of an electron.\n• Neutrons: Discovered by James Chadwick in 1932. They are neutral subatomic particles located in the nucleus with mass equal to a proton.',
        keyPoints: [
          'Electron: Mass = 1/2000 u, Charge = -1',
          'Proton: Mass = 1 u, Charge = +1',
          'Neutron: Mass = 1 u, Charge = 0'
        ],
        diagramType: 'atom'
      },
      {
        id: 'c9-atoms-s2',
        title: '2. Rutherford Gold Foil Experiment',
        body: 'Ernest Rutherford bombarded a thin gold foil with fast-moving alpha (α) particles. His observations revolutionized atomic physics:\n\n• Observation: Most α-particles passed straight through. Some were deflected by small angles. A tiny fraction (1 in 12,000) rebounded completely.\n• Conclusion: Most space inside an atom is empty. All positive charge and mass is concentrated in a tiny central region called the Nucleus. The nucleus is extremely small compared to the size of the entire atom.',
        keyPoints: [
          'Proposed the nuclear model of the atom.',
          'Drawback: According to electromagnetic theory, accelerating electrons must radiate energy and spiral into the nucleus, making atoms highly unstable.'
        ]
      },
      {
        id: 'c9-atoms-s3',
        title: '3. Bohr Model & Electron Configuration',
        body: 'Neils Bohr solved Rutherford\'s instability issue in 1913. He postulated that electrons revolve only in discrete, non-radiating orbits called energy levels or shells (K, L, M, N...).\n\nElectron distribution is governed by the Bohr-Bury scheme:\n• Maximum number of electrons in a shell = 2n², where n is the shell number.\n• Maximum number of electrons in the outermost orbit is 8 (Octet rule).\n• Valency is the combining capacity of an atom, determined by the valence electrons.',
        keyPoints: [
          'K Shell (n=1) max: 2, L Shell (n=2) max: 8, M Shell (n=3) max: 18.',
          'Isotopes: Atoms of same element with same Atomic Number but different Mass Numbers (e.g., Protium, Deuterium, Tritium).',
          'Isobars: Atoms of different elements with same Mass Number but different Atomic Numbers (e.g., Calcium-40 and Argon-40).'
        ]
      }
    ],
    flashcards: [
      {
        id: 'f-atoms-1',
        front: 'What is Valency?',
        back: 'Valency is the combining capacity of an atom. It is determined by the number of valence electrons an atom must gain, lose, or share to complete its octet (8 electrons in outer shell).',
        category: 'Chemistry'
      },
      {
        id: 'f-atoms-2',
        front: 'What are Isotopes?',
        back: 'Atoms of the same element having the same atomic number (number of protons) but different mass numbers (number of neutrons). Example: Carbon-12 and Carbon-14.',
        category: 'Chemistry'
      },
      {
        id: 'f-atoms-3',
        front: 'What was J.J. Thomson\'s model of an atom called?',
        back: 'The Plum Pudding model (or Watermelon model), where positive charge is spread throughout a sphere with electrons embedded like seeds.',
        category: 'Chemistry'
      }
    ],
    quiz: [
      {
        id: 'q-atoms-1',
        question: 'Which experiment led to the discovery of the atomic nucleus?',
        options: ['Cathode ray experiment', 'Gold foil α-particle scattering experiment', 'Canal ray experiment', 'Oil drop experiment'],
        correctAnswerIndex: 1,
        explanation: 'Rutherfords gold foil α-particle scattering experiment showed that alpha particles deflected at large angles and rebounded, proving a dense positively charged core called the nucleus.'
      },
      {
        id: 'q-atoms-2',
        question: 'What is the maximum number of electrons that can be accommodated in the M shell (n = 3)?',
        options: ['8', '18', '32', '2'],
        correctAnswerIndex: 1,
        explanation: 'Using the 2n² formula for the M shell (n = 3): 2 × (3)² = 2 × 9 = 18 electrons.'
      },
      {
        id: 'q-atoms-3',
        question: 'What is the valency of an Oxygen atom (Atomic number = 8)?',
        options: ['8', '6', '2', '0'],
        correctAnswerIndex: 2,
        explanation: 'Oxygen has atomic number 8. Its electronic configuration is (2, 6). To complete its octet, it needs to gain 2 electrons, making its combining capacity (valency) 2.'
      }
    ]
  },

  // ==================== CLASS 10 CHAPTERS ====================
  {
    id: 'c10-reactions',
    title: 'Chemical Reactions and Equations',
    description: 'Learn to write and balance chemical equations. Explore types of chemical reactions, temperature shifts, corrosion, and the science of food rancidity.',
    classLevel: 10,
    subject: 'Chemistry',
    readingTime: '15 mins',
    keyConcepts: ['Balancing Equations', 'Combination & Decomposition', 'Displacement & Redox', 'Corrosion & Rancidity'],
    sections: [
      {
        id: 'c10-reactions-s1',
        title: '1. What is a Chemical Reaction?',
        body: 'A chemical reaction is a process where reactants transform into new substances with entirely different properties (products) through breaking and making of chemical bonds.\n\nEvidence of a reaction:\n• Change in state or color.\n• Evolution of a gas.\n• Change in temperature (Exothermic vs. Endothermic).\n• Formation of a precipitate (insoluble solid).',
        keyPoints: [
          'Exothermic reactions release heat (e.g., Respiration, combustion).',
          'Endothermic reactions absorb energy (e.g., Photosynthesis, thermal decomposition).'
        ],
        diagramType: 'reaction'
      },
      {
        id: 'c10-reactions-s2',
        title: '2. Balancing Chemical Equations',
        body: 'According to the Law of Conservation of Mass, mass can neither be created nor destroyed in a chemical reaction. Therefore, the total number of atoms of each element must remain the same on both sides (Reactants and Products).\n\nWe balance equations using the hit-and-trial method by adding stoichiometric coefficients (never altering subscripts in chemical formulas).\n\nExample:\n3Fe(s) + 4H₂O(g) → Fe₃O₄(s) + 4H₂(g)',
        keyPoints: [
          'Write down reactant and product atom counts.',
          'Balance the metal atoms first, followed by non-metals, then hydrogen and oxygen.'
        ]
      },
      {
        id: 'c10-reactions-s3',
        title: '3. Types of Reactions & Redox',
        body: 'Chemical reactions can be classified into major types:\n\n• Combination: Two or more reactants form one product. (CaO + H₂O → Ca(OH)₂ + Heat)\n• Decomposition: A single reactant breaks down into multiple products using Heat (Thermal), Light (Photolytic), or Electricity (Electrolytic).\n• Displacement: A more reactive metal displaces a less reactive metal from its salt solution (Fe + CuSO₄ → FeSO₄ + Cu).\n• Double Displacement: Exchange of ions between reactants (Precipitation reaction).\n• Redox (Reduction-Oxidation): Oxidation is the gain of oxygen or loss of hydrogen. Reduction is the loss of oxygen or gain of hydrogen. They always occur simultaneously.',
        keyPoints: [
          'In Fe + CuSO₄ (blue) → FeSO₄ (green) + Cu, iron displaces copper because iron is higher in the reactivity series.',
          'Corrosion: Slow eating up of metals by moisture and air (e.g., rusting of iron, black coating on silver).',
          'Rancidity: Oxidation of fats and oils in food, leading to bad smell and taste. Prevented by flushing with Nitrogen gas.'
        ]
      }
    ],
    flashcards: [
      {
        id: 'f-reactions-1',
        front: 'Why do we need to balance chemical equations?',
        back: 'To satisfy the Law of Conservation of Mass, which states that mass can neither be created nor destroyed in a chemical reaction.',
        category: 'Chemistry'
      },
      {
        id: 'f-reactions-2',
        front: 'What is a Redox reaction?',
        back: 'A reaction where both Oxidation (gain of oxygen/loss of electrons) and Reduction (loss of oxygen/gain of electrons) take place simultaneously.',
        category: 'Chemistry'
      },
      {
        id: 'f-reactions-3',
        front: 'What gas is flushed in potato chip packets to prevent rancidity?',
        back: 'Nitrogen gas. It is an inert gas that prevents the oxidation of fats and oils in chips.',
        category: 'Chemistry'
      },
      {
        id: 'f-reactions-4',
        front: 'Identify the oxidizing agent in: CuO + H₂ → Cu + H₂O',
        back: 'CuO (Copper Oxide). It provides the oxygen for the oxidation of Hydrogen, and gets reduced to Cu itself.',
        category: 'Chemistry'
      }
    ],
    quiz: [
      {
        id: 'q-reactions-1',
        question: 'When silver chloride (AgCl) is kept in sunlight, it turns grey. What type of reaction is this?',
        options: ['Thermal Decomposition', 'Photolytic Decomposition', 'Displacement Reaction', 'Combination Reaction'],
        correctAnswerIndex: 1,
        explanation: 'White silver chloride decomposes into grey silver metal and chlorine gas in the presence of sunlight. Since light energy is used, it is a photolytic decomposition reaction.'
      },
      {
        id: 'q-reactions-2',
        question: 'Which of the following is an endothermic process?',
        options: ['Respiration', 'Decomposition of organic matter', 'Photosynthesis', 'Burning of natural gas'],
        correctAnswerIndex: 2,
        explanation: 'Photosynthesis requires plants to absorb solar energy to synthesize glucose, making it an endothermic reaction. Respiration and burning of gas are highly exothermic.'
      },
      {
        id: 'q-reactions-3',
        question: 'Why does a blue copper sulphate solution turn green when an iron nail is dipped in it?',
        options: ['Iron is oxidized to copper', 'Iron displaces copper from CuSO₄ forming green FeSO₄', 'Copper sulphate decomposes', 'Iron dissolves without reacting'],
        correctAnswerIndex: 1,
        explanation: 'Iron is more reactive than copper. It displaces copper from CuSO₄ (blue) to form iron sulphate (FeSO₄), which is light green, while reddish-brown copper deposits on the iron nail.'
      }
    ]
  },
  {
    id: 'c10-electricity',
    title: 'Electricity',
    description: 'Unlock the physics of electric charge, current, and potential difference. Master Ohm\'s law, resistance factors, series/parallel networks, and Joule heating.',
    classLevel: 10,
    subject: 'Physics',
    readingTime: '16 mins',
    keyConcepts: ['Ohm\'s Law', 'Factors affecting Resistance', 'Series & Parallel Resistors', 'Joule\'s Heating Effect'],
    sections: [
      {
        id: 'c10-electricity-s1',
        title: '1. Electric Current & Potential Difference',
        body: 'Electric current (I) is defined as the rate of flow of electric charge (Q) through any cross-section of a conductor:\n\nFormula: I = Q / t\n• S.I. unit of charge is Coulomb (C), and current is Ampere (A). One electron carries -1.6 × 10⁻¹⁹ C of charge.\n\nElectric Potential Difference (V) between two points is the work done (W) to move a unit charge (Q) from one point to another:\n\nFormula: V = W / Q\n• S.I. unit is Volt (V). It is measured using a high-resistance Voltmeter connected in parallel.',
        keyPoints: [
          'Ammeter measures current; connected in Series; has low resistance.',
          'Voltmeter measures potential difference; connected in Parallel; has high resistance.',
          'Current flows from positive terminal to negative terminal (opposite to electron flow).'
        ],
        diagramType: 'circuit'
      },
      {
        id: 'c10-electricity-s2',
        title: '2. Ohm\'s Law & Resistance',
        body: 'Proposed by Georg Simon Ohm in 1827. It states that the electric current flowing through a metallic conductor is directly proportional to the potential difference across its terminals, provided temperature remains constant.\n\nFormula: V ∝ I  =>  V = IR\nWhere R is a constant called Resistance.\n\nFactors affecting Resistance:\n1. Length of the conductor (R ∝ l)\n2. Area of cross-section (R ∝ 1/A)\n3. Nature of material (Resistivity, ρ)\nFormula: R = ρ (l / A)\nResistivity (ρ) is a property of the material and does not change with length or thickness.',
        keyPoints: [
          'S.I. unit of Resistance is Ohm (Ω); unit of Resistivity is Ohm-meter (Ω·m).',
          'Alloys have higher resistivity than pure metals and do not oxidize (burn) at high temperatures, hence used in heating devices.'
        ]
      },
      {
        id: 'c10-electricity-s3',
        title: '3. Resistor Networks & Joule\'s Heating',
        body: 'Resistors can be arranged in two combinations:\n\n• Series: Resistors joined end-to-end. Current is same; voltage divides. (Rs = R₁ + R₂ + R₃)\n• Parallel: Resistors joined across same two points. Voltage is same; current divides. (1/Rp = 1/R₁ + 1/R₂ + 1/R₃)\n\nJoule\'s Law of Heating:\nWhen an electric current passes through a purely resistive circuit, chemical energy of the source is entirely dissipated as heat. Heat generated (H) is:\n\nFormula: H = I²Rt = VIt = (V² / R) * t\n\nElectric Power (P):\nP = VI = I²R = V² / R\n• S.I. unit is Watt (W). Commercial unit is Kilowatt-hour (kWh), called 1 unit of electricity (1 kWh = 3.6 × 10⁶ Joules).',
        keyPoints: [
          'Parallel circuits are used in households so that if one appliance fails, others continue working and every appliance gets full source voltage.',
          'Fuse wire is a safety device with low melting point; melts during short-circuiting or overloading.'
        ]
      }
    ],
    flashcards: [
      {
        id: 'f-elec-1',
        front: 'State Ohm\'s Law.',
        back: 'The electric current flowing through a conductor is directly proportional to the potential difference across its ends, provided temperature and physical conditions remain constant (V = IR).',
        category: 'Physics'
      },
      {
        id: 'f-elec-2',
        front: 'Why is a voltmeter connected in parallel while an ammeter is connected in series?',
        back: 'A voltmeter has high resistance to avoid drawing significant current from the circuit. An ammeter has low resistance to ensure current flowing through it remains unchanged.',
        category: 'Physics'
      },
      {
        id: 'f-elec-3',
        front: 'What is the relation between commercial unit of energy (kWh) and Joules?',
        back: '1 kWh = 1000 W × 3600 s = 3,600,000 Joules (or 3.6 × 10⁶ J).',
        category: 'Physics'
      },
      {
        id: 'f-elec-4',
        front: 'How does doubling the length of a wire affect its resistivity?',
        back: 'It has NO effect. Resistivity is a material property that depends only on the material\'s nature and temperature, not on dimensions.',
        category: 'Physics'
      }
    ],
    quiz: [
      {
        id: 'q-elec-1',
        question: 'Two resistors of 6 Ω and 3 Ω are connected in parallel. What is their equivalent resistance?',
        options: ['9 Ω', '2 Ω', '4.5 Ω', '18 Ω'],
        correctAnswerIndex: 1,
        explanation: 'For parallel resistors: 1/Rp = 1/6 + 1/3 = 1/6 + 2/6 = 3/6 = 1/2. Therefore, Rp = 2 Ω.'
      },
      {
        id: 'q-elec-2',
        question: 'Which factor does NOT affect the resistivity of a conductor?',
        options: ['Temperature', 'Length of the conductor', 'Nature of the material', 'Both length and area of cross-section'],
        correctAnswerIndex: 3,
        explanation: 'Resistivity (ρ) is an intrinsic property of a substance. It depends on material nature and temperature, but is completely independent of the length or cross-sectional area of the wire.'
      },
      {
        id: 'q-elec-3',
        question: 'An electric bulb is rated 220V and 100W. When it is operated on 110V, what will be the power consumed?',
        options: ['50W', '25W', '75W', '100W'],
        correctAnswerIndex: 1,
        explanation: 'The bulb\'s resistance R = V² / P = (220)² / 100 = 48400 / 100 = 484 Ω. At 110V, Power consumed P = V² / R = (110)² / 484 = 12100 / 484 = 25 Watts.'
      }
    ]
  },
  // ==================== CLASS 11 CHAPTERS ====================
  {
    id: 'c11-kinematics',
    title: 'Kinematics & Laws of Motion',
    description: 'Master motion in a straight line and plane. Understand vector addition, resolution, projectile trajectory, and Newton\'s classical laws with friction dynamics.',
    classLevel: 11,
    subject: 'Physics',
    readingTime: '18 mins',
    keyConcepts: ['Vector Resolution', 'Projectile Motion', 'Static & Kinetic Friction', 'Momentum Conservation'],
    sections: [
      {
        id: 'c11-kin-s1',
        title: '1. Vectors & Projectile Mechanics',
        body: 'Motion in a plane requires vectors to describe position, velocity, and acceleration. Any vector can be resolved into perpendicular components: A = Ax î + Ay ĵ.\n\nProjectile motion is a form of two-dimensional motion under constant gravitational acceleration:\n• Time of Flight (T) = 2u sinθ / g\n• Horizontal Range (R) = u² sin(2θ) / g\n• Maximum Height (H) = u² sin²θ / 2g',
        keyPoints: [
          'Range is maximum when launch angle θ = 45°.',
          'Horizontal velocity remains constant throughout the motion because there is no horizontal acceleration.'
        ],
        diagramType: 'circuit'
      },
      {
        id: 'c11-kin-s2',
        title: '2. Friction Dynamics & Laws of Motion',
        body: 'Force is an agent that changes or tends to change the state of rest or uniform motion of a body. Friction is a self-adjusting contact force that opposes relative motion between surfaces.\n\n• Static Friction (fs) ≤ μs N (where N is the normal contact force).\n• Kinetic Friction (fk) = μk N.\n• In general, Coefficient of Static Friction (μs) is larger than Coefficient of Kinetic Friction (μk).',
        keyPoints: [
          'Friction is a non-conservative force that dissipates mechanical energy as heat.',
          'Rolling friction is much smaller than sliding friction, which is why wheels are highly efficient.'
        ]
      }
    ],
    flashcards: [
      {
        id: 'f-kin-1',
        front: 'At what angle of projection is the horizontal range of a projectile maximum?',
        back: 'At 45 degrees, since sin(2θ) reaches its maximum value of 1 when 2θ = 90 degrees.',
        category: 'Physics'
      },
      {
        id: 'f-kin-2',
        front: 'Why is static friction called a self-adjusting force?',
        back: 'Because its magnitude increases or decreases to exactly match the applied external force, up to its maximum limiting value (μs N), keeping the body at rest.',
        category: 'Physics'
      }
    ],
    quiz: [
      {
        id: 'q-kin-1',
        question: 'A projectile is launched at 30° with velocity u. At what other angle will it achieve the exact same horizontal range?',
        options: ['60°', '45°', '15°', '90°'],
        correctAnswerIndex: 0,
        explanation: 'Horizontal range is identical for complementary angles θ and (90° - θ). Since 90° - 30° = 60°, the range at 60° is exactly the same.'
      },
      {
        id: 'q-kin-2',
        question: 'If the normal force acting on a sliding block is doubled, what happens to the kinetic friction force?',
        options: ['It is halved', 'It is doubled', 'It remains unchanged', 'It becomes four times larger'],
        correctAnswerIndex: 1,
        explanation: 'Kinetic friction is given by fk = μk N. Since fk is directly proportional to the normal force N, doubling N will double the kinetic friction force.'
      }
    ]
  },
  {
    id: 'c11-bonding',
    title: 'Chemical Bonding & Molecular Structure',
    description: 'Explore how atoms combine to form stable molecules. Master Lewis structures, valence bond theory, VSEPR molecular geometry, and atomic orbital hybridization.',
    classLevel: 11,
    subject: 'Chemistry',
    readingTime: '20 mins',
    keyConcepts: ['VSEPR Geometry', 'Orbital Hybridization', 'Octet Rule Exceptions', 'Hydrogen Bonding'],
    sections: [
      {
        id: 'c11-bond-s1',
        title: '1. VSEPR Theory & Molecular Geometry',
        body: 'The Valence Shell Electron Pair Repulsion (VSEPR) theory predicts the 3D shape of molecules based on electron pair repulsion:\n\n• Electron pairs around a central atom arrange themselves to minimize repulsion.\n• Order of repulsion: Lone Pair - Lone Pair (lp-lp) > Lone Pair - Bond Pair (lp-bp) > Bond Pair - Bond Pair (bp-bp).\n\nShapes:\n• 2 Bond Pairs (e.g., CO₂): Linear shape (180°).\n• 3 Bond Pairs (e.g., BF₃): Trigonal Planar shape (120°).\n• 4 Bond Pairs (e.g., CH₄): Tetrahedral shape (109.5°).\n• 3 Bond Pairs, 1 Lone Pair (e.g., NH₃): Trigonal Pyramidal (107° due to lp-bp repulsion).',
        keyPoints: [
          'Lone pairs cause bonding angles to compress or deviate from regular geometries.',
          'Water (H₂O) has 2 bond pairs and 2 lone pairs, resulting in a bent or V-shape with 104.5° angle.'
        ],
        diagramType: 'atom'
      },
      {
        id: 'c11-bond-s2',
        title: '2. Concept of Hybridization',
        body: 'Hybridization is the intermixing of atomic orbitals of slightly different energies of the same atom to produce a new set of equivalent orbitals called hybrid orbitals.\n\n• sp Hybridization: Mixing of 1 s and 1 p orbital. Linear geometry (e.g., BeCl₂).\n• sp² Hybridization: Mixing of 1 s and 2 p orbitals. Trigonal Planar geometry (e.g., BCl₃).\n• sp³ Hybridization: Mixing of 1 s and 3 p orbitals. Tetrahedral geometry (e.g., CH₄, NH₃, H₂O).',
        keyPoints: [
          'Hybrid orbitals form stronger, more directed covalent sigma (σ) bonds than pure atomic orbitals.',
          'Pi (π) bonds are formed by lateral/sideways overlap of unhybridized p-orbitals.'
        ]
      }
    ],
    flashcards: [
      {
        id: 'f-bond-1',
        front: 'Why is the bond angle in NH₃ (107°) smaller than in CH₄ (109.5°)?',
        back: 'NH₃ has one lone pair on nitrogen. Since lone pair-bond pair repulsion is stronger than bond pair-bond pair repulsion, the N-H bonds are pushed closer together, compressing the angle.',
        category: 'Chemistry'
      },
      {
        id: 'f-bond-2',
        front: 'What type of hybridization is present in Ethene (C₂H₄) carbon atoms?',
        back: 'sp² hybridization, which leaves one unhybridized p-orbital on each carbon atom to form the sideways pi (π) double bond.',
        category: 'Chemistry'
      }
    ],
    quiz: [
      {
        id: 'q-bond-1',
        question: 'Which of the following molecules has a linear geometry?',
        options: ['H₂O', 'CO₂', 'SO₂', 'NH₃'],
        correctAnswerIndex: 1,
        explanation: 'CO₂ has a central Carbon double-bonded to two Oxygen atoms with no lone pairs on Carbon. The electron pairs align at 180° for minimum repulsion, making it strictly linear.'
      },
      {
        id: 'q-bond-2',
        question: 'What is the hybridization of the central atom in a SF₆ molecule?',
        options: ['sp³d', 'sp³', 'sp³d²', 'dsp²'],
        correctAnswerIndex: 2,
        explanation: 'Sulfur has 6 valence electrons and forms 6 single bonds with Fluorine. Six electron pairs around Sulfur require an sp³d² hybridization, resulting in octahedral geometry.'
      }
    ]
  },
  // ==================== CLASS 12 CHAPTERS ====================
  {
    id: 'c12-electrostatics',
    title: 'Electrostatics & Field Theory',
    description: 'Unveil the power of stationary electric charges. Study Coulomb\'s Law, electric field vectors, dipole moments, Gauss\'s theorem, electrical potential, and parallel-plate capacitance.',
    classLevel: 12,
    subject: 'Physics',
    readingTime: '22 mins',
    keyConcepts: ['Coulomb\'s Law', 'Electric Flux & Gauss Law', 'Equipotential Surfaces', 'Capacitor Dielectrics'],
    sections: [
      {
        id: 'c12-elec-s1',
        title: '1. Coulomb\'s Law & Electric Fields',
        body: 'Coulomb\'s Law states that the electrostatic force (F) between two point charges q₁ and q₂ is directly proportional to the product of their charges and inversely proportional to the square of distance (r) between them:\n\nFormula: F = k * (|q₁ q₂| / r²)\nWhere k = 1 / (4πε₀) ≈ 9 × 10⁹ N·m²/C² in vacuum.\n\nElectric Field (E) is the space surrounding a charge where its electrical influence can be felt:\n\nFormula: E = F / q = k * (q / r²)\nElectric field lines originate from positive charges and terminate on negative charges. They never intersect.',
        keyPoints: [
          'Electric field inside a hollow charged conductor is always zero.',
          'Superposition Principle: Total electrostatic force on a charge is the vector sum of forces exerted on it by all other charges.'
        ],
        diagramType: 'circuit'
      },
      {
        id: 'c12-elec-s2',
        title: '2. Gauss\'s Law & Parallel Plate Capacitance',
        body: 'Electric Flux (Φ) is the measure of the number of electric field lines passing through a closed surface. Gauss\'s Law states that the total electric flux through any closed Gaussian surface is equal to 1/ε₀ times the net enclosed charge:\n\nFormula: Φ = ∮ E · dA = Qenclosed / ε₀\n\nCapacitance (C) measures a system\'s ability to store electric charge per unit potential difference: C = Q / V. For a parallel plate capacitor:\n\nFormula: C = ε₀ A / d\nIf a dielectric of constant K is inserted, capacitance increases: C\' = K C.',
        keyPoints: [
          'S.I. unit of capacitance is Farad (F). Dielectrics polarize and reduce the net electric field, thus increasing capacity.',
          'Equipotential Surface: A surface where electric potential is identical at all points. No work is done to move a charge along it.'
        ]
      }
    ],
    flashcards: [
      {
        id: 'f-elst-1',
        front: 'Why do two electric field lines never cross each other?',
        back: 'If they crossed, there would be two different directions of the electric field vector at the intersection point, which is physically impossible.',
        category: 'Physics'
      },
      {
        id: 'f-elst-2',
        front: 'How does inserting a dielectric material affect the capacitance of a parallel-plate capacitor?',
        back: 'It increases the capacitance by a factor of K (the dielectric constant), because the dielectric polarizes, lowering the potential difference for the same charge.',
        category: 'Physics'
      }
    ],
    quiz: [
      {
        id: 'q-elst-1',
        question: 'What is the work done in moving a 5 μC charge over a distance of 10 cm on an equipotential surface?',
        options: ['50 J', '0.5 J', '0 J', '5 J'],
        correctAnswerIndex: 2,
        explanation: 'By definition, the electric potential difference between any two points on an equipotential surface is zero. Since Work W = q ΔV, W = 5 μC × 0 = 0 Joules.'
      },
      {
        id: 'q-elst-2',
        question: 'If the distance between the plates of a parallel plate capacitor is halved, what happens to its capacitance?',
        options: ['It is halved', 'It is doubled', 'It is quadrupled', 'It remains unchanged'],
        correctAnswerIndex: 1,
        explanation: 'Capacitance is C = ε₀ A / d. Since C is inversely proportional to distance d, halving d will double the capacitance.'
      }
    ]
  },
  {
    id: 'c12-molecular',
    title: 'Molecular Basis of Inheritance',
    description: 'Deconstruct genetic mechanisms at the molecular tier. Study DNA double helix structure, packaging, semi-conservative replication, transcription, codons, and protein translation.',
    classLevel: 12,
    subject: 'Biology',
    readingTime: '24 mins',
    keyConcepts: ['DNA Packaging', 'Semi-Conservative Replication', 'RNA Transcription', 'Genetic Code & Translation'],
    sections: [
      {
        id: 'c12-mol-s1',
        title: '1. DNA Structure & Semi-Conservative Replication',
        body: 'DNA (Deoxyribonucleic Acid) is a double-stranded polynucleotide chain. Watson and Crick proposed the Double Helix model in 1953:\n\n• Two strands run antiparallel (5\'→3\' and 3\'→5\') with complementary base pairing: Adenine (A) pairs with Thymine (T) via 2 hydrogen bonds; Guanine (G) pairs with Cytosine (C) via 3 hydrogen bonds.\n\nDNA Replication is Semi-Conservative, as proven by Meselson and Stahl in 1958. During replication, each parent strand acts as a template for synthesis of a new complementary strand, resulting in hybrid DNA molecules containing one parent strand and one newly synthesized strand.',
        keyPoints: [
          'DNA Polymerase synthesizes DNA only in the 5\' to 3\' direction, producing a leading continuous strand and lagging discontinuous Okazaki fragments.',
          'Nucleosome: Structural unit of chromatin where negative DNA wraps around positive Histone octamer cores.'
        ],
        diagramType: 'cell'
      },
      {
        id: 'c12-mol-s2',
        title: '2. Transcription, Translation & Genetic Code',
        body: 'The Central Dogma states that genetic information flows from DNA → RNA → Protein.\n\n• Transcription: Process of copying genetic information from one strand of DNA into single-stranded complementary RNA (mRNA) by RNA Polymerase.\n• Genetic Code: Dictionary of 64 triplet codons. It is universal, degenerate (some amino acids coded by multiple codons), and non-overlapping. AUG is the start codon.\n• Translation: Process of polymerizing amino acids to form a polypeptide chain at the ribosomes based on the mRNA codon sequence. tRNA acts as an adapter.',
        keyPoints: [
          'AUG codes for Methionine and acts as the initiation codon.',
          'Three stop codons (UAA, UAG, UGA) terminate translation and do not code for any amino acid.'
        ]
      }
    ],
    flashcards: [
      {
        id: 'f-mol-1',
        front: 'What did the Meselson and Stahl experiment prove?',
        back: 'It proved that DNA replication is semi-conservative, meaning each newly formed DNA molecule contains one original parent strand and one newly synthesized daughter strand.',
        category: 'Biology'
      },
      {
        id: 'f-mol-2',
        front: 'What are the start and stop codons in genetic translation?',
        back: 'AUG is the initiation (start) codon. UAA, UAG, and UGA are termination (stop) codons.',
        category: 'Biology'
      }
    ],
    quiz: [
      {
        id: 'q-mol-1',
        question: 'Which enzyme is responsible for synthesizing lagging strand Okazaki fragments during replication?',
        options: ['DNA Helicase', 'DNA Polymerase', 'DNA Ligase', 'RNA Primase'],
        correctAnswerIndex: 1,
        explanation: 'DNA Polymerase synthesizes both leading and lagging strands. DNA Ligase is then used to join the Okazaki fragments together on the lagging strand.'
      },
      {
        id: 'q-mol-2',
        question: 'A template strand of DNA has the sequence 3\'-ATCGTA-5\'. What will be the corresponding transcribed mRNA sequence?',
        options: ['5\'-UAGCAU-3\'', '5\'-TAGCAT-3\'', '5\'-UACGUA-3\'', '3\'-UAGCAU-5\''],
        correctAnswerIndex: 0,
        explanation: 'mRNA is synthesized complementary to the template DNA in the 5\' to 3\' direction. A pairs with U, T with A, C with G, and G with C. Thus, 3\'-ATCGTA-5\' transcribes to 5\'-UAGCAU-3\'.'
      }
    ]
  },
  // ==================== CLASS 10 OPTICS CHAPTER ====================
  {
    id: 'c10-optics',
    title: 'Light: Reflection, Refraction & Optical Phenomena',
    description: 'Master the principles of Ray Optics. Understand mirror and lens formulas, Snell\'s law, refraction through prisms, defects of vision, and natural scattering phenomena.',
    classLevel: 10,
    subject: 'Physics',
    readingTime: '20 mins',
    keyConcepts: ['Reflection & Mirrors', 'Refraction & Lenses', 'Human Eye Defects', 'Scattering & Dispersion'],
    sections: [
      {
        id: 'c10-optics-s1',
        title: '1. Reflection of Light & Mirror Formula',
        body: 'Reflection is the bouncing back of light into the same medium when it falls on a polished surface. Laws of reflection apply to all types of reflecting surfaces, including spherical mirrors:\n\n• The angle of incidence (i) equals the angle of reflection (r).\n• The incident ray, the normal, and the reflected ray all lie in the same plane.\n\nFor spherical mirrors, we use the Mirror Formula to calculate object distance (u), image distance (v), and focal length (f):\n\n1/f = 1/v + 1/u\n\nLinear Magnification (m) is given by:\nm = h\'/h = -v/u\nWhere h\' is image height and h is object height. Saffron/Sanskritized sign conventions state that distances in the direction of incident light are positive.',
        keyPoints: [
          'Concave mirrors can produce real, inverted images as well as virtual, erect images depending on object position.',
          'Convex mirrors always produce virtual, erect, and diminished images regardless of object position.',
          'Focus (f) is half of the Radius of Curvature (R): f = R/2.'
        ],
        diagramType: 'atom'
      },
      {
        id: 'c10-optics-s2',
        title: '2. Refraction of Light & Snell\'s Law',
        body: 'Refraction is the bending of light when it passes obliquely from one transparent medium to another. It occurs due to the change in the speed of light.\n\n• Snell\'s Law of Refraction: The ratio of sine of angle of incidence to the sine of angle of refraction is constant for a given pair of media:\nsin(i) / sin(r) = constant = n₂₁ (refractive index of medium 2 with respect to medium 1).\n\nFor spherical lenses, the Lens Formula is:\n1/f = 1/v - 1/u\n\nAnd Lens Magnification (m) is:\nm = h\'/h = v/u\n\nPower of a Lens (P) is the reciprocal of its focal length in meters (P = 1/f), measured in Dioptres (D).',
        keyPoints: [
          'When light goes from a rarer to a denser medium, it bends towards the normal.',
          'When light goes from a denser to a rarer medium, it bends away from the normal.',
          'Convex lenses are converging lenses, whereas concave lenses are diverging lenses.'
        ]
      },
      {
        id: 'c10-optics-s3',
        title: '3. Human Eye & Atmospheric Scattering',
        body: 'The human eye is a natural optical instrument. The ciliary muscles adjust the curvature of the eye lens to focus nearby or distant objects onto the retina (Power of Accommodation).\n\nCommon defects of vision include:\n• Myopia (Near-sightedness): Distant objects cannot be seen clearly. Corrected using a concave lens.\n• Hypermetropia (Far-sightedness): Nearby objects cannot be seen clearly. Corrected using a convex lens.\n• Presbyopia: Aging causes weakening of ciliary muscles. Corrected using bifocal lenses.\n\nAtmospheric scattering explains beautiful natural phenomena. Blue sky occurs because tiny air molecules scatter shorter wavelengths of blue light more than red light (Rayleigh scattering). At sunset/sunrise, light travels longer distances through the atmosphere, scattering away most blue light, leaving red/orange wavelengths to reach our eyes.',
        keyPoints: [
          'The least distance of distinct vision for a normal young eye is 25 cm.',
          'Dispersion: The splitting of white light into its seven component colors (VIBGYOR) when passing through a prism.',
          'Tyndall Effect: Scattering of light by colloidal particles in a suspension.'
        ]
      }
    ],
    flashcards: [
      {
        id: 'f-optics-1',
        front: 'What is the sign of focal length for Concave and Convex mirrors?',
        back: 'Focal length of a Concave mirror is always Negative (-f). Focal length of a Convex mirror is always Positive (+f) under Cartesian sign conventions.',
        category: 'Physics'
      },
      {
        id: 'f-optics-2',
        front: 'State Snell\'s Law of Refraction.',
        back: 'The ratio of the sine of the angle of incidence (i) to the sine of the angle of refraction (r) is constant for a given color of light and pair of media: sin(i)/sin(r) = n₂/n₁.',
        category: 'Physics'
      },
      {
        id: 'f-optics-3',
        front: 'How is Myopia corrected and what lens is used?',
        back: 'Myopia (near-sightedness) is corrected using a Concave (diverging) lens of suitable power, which focuses the parallel rays from distant objects back onto the retina.',
        category: 'Physics'
      }
    ],
    quiz: [
      {
        id: 'q-optics-1',
        question: 'An object is placed 20 cm in front of a concave mirror of focal length 10 cm. Where will the image be formed?',
        options: ['10 cm in front of the mirror', '20 cm in front of the mirror', '20 cm behind the mirror', 'At infinity'],
        correctAnswerIndex: 1,
        explanation: 'Since the focal length f = -10 cm and u = -20 cm, the object is placed at the Center of Curvature (R = 2f = 20 cm). Concave mirrors form an image at the center of curvature itself when the object is placed there. v = -20 cm.'
      },
      {
        id: 'q-optics-2',
        question: 'Why does the clear sky appear blue during a bright sunny day?',
        options: ['Due to refraction through the atmosphere', 'Due to scattering of blue light by air molecules', 'Due to reflection of oceans', 'Due to absorption of red light by the clouds'],
        correctAnswerIndex: 1,
        explanation: 'Air molecules (N₂ and O₂) are smaller than the wavelength of visible light. They scatter shorter wavelengths (blue/violet) much more strongly than longer wavelengths (red), making the sky appear blue.'
      }
    ]
  }
];
