(() => {
	const STORAGE_KEY = 'wislabWorksheet';
	const EXERCISE_COUNT = 30;

	const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

	const pick = (arr) => arr[randomInt(0, arr.length - 1)];

	const shuffle = (arr) => {
		for (let i = arr.length - 1; i > 0; i -= 1) {
			const j = randomInt(0, i);
			[arr[i], arr[j]] = [arr[j], arr[i]];
		}
		return arr;
	};

	const randE = () => randomInt(1, 9);
	const randT = (maxTens = 9) => randomInt(1, maxTens) * 10;

	const randTE = (maxValue = 99) => {
		while (true) {
			const t = randomInt(1, Math.floor(maxValue / 10));
			const e = randE();
			const value = t * 10 + e;
			if (value <= maxValue) {
				return value;
			}
		}
	};

	const activeSection = (max) => (max === '100' ? '100' : '20');

	const formatExercise = (a, op, b) => `${a} ${op} ${b} =`;

	const generators20 = {
		'T+E': () => ({ text: formatExercise(10, '+', randE()) }),
		'E+T': () => ({ text: formatExercise(randE(), '+', 10) }),
		'TE+E': () => {
			while (true) {
				const a = randTE(19);
				const maxB = Math.min(9 - (a % 10), 20 - a);
				if (maxB >= 1) {
					return { text: formatExercise(a, '+', randomInt(1, maxB)) };
				}
			}
		},
		'E+TE': () => {
			while (true) {
				const b = randTE(19);
				const maxA = Math.min(9 - (b % 10), 20 - b);
				if (maxA >= 1) {
					return { text: formatExercise(randomInt(1, maxA), '+', b) };
				}
			}
		},
		'20-E': () => ({ text: formatExercise(20, '-', randE()) }),
		'20-TE': () => ({ text: formatExercise(20, '-', randTE(19)) }),
		'TE-E': () => {
			const a = randTE(19);
			return { text: formatExercise(a, '-', randomInt(1, a % 10)) };
		},
		'TE-E=T': () => {
			const a = randTE(19);
			const b = a % 10;
			return { text: formatExercise(a, '-', b), rhs: a - b };
		},
		'TE-TE': () => {
			while (true) {
				const a = randTE(19);
				const b = randTE(19);
				if (a >= b && (a % 10) >= (b % 10)) {
					return { text: formatExercise(a, '-', b) };
				}
			}
		},
		'E+Emb': () => {
			const a = randE();
			const b = randomInt(10 - a, 9);
			return { text: formatExercise(a, '+', b) };
		},
		'TE+E=T': () => {
			while (true) {
				const a = randTE(19);
				const unit = a % 10;
				const b = 10 - unit;
				if (b >= 1 && b <= 9) {
					return { text: formatExercise(a, '+', b), rhs: a + b };
				}
			}
		},
		'TE-Emb': () => {
			const a = randTE(19);
			const unit = a % 10;
			const b = randomInt(unit + 1, 9);
			return { text: formatExercise(a, '-', b), rhs: a - b };
		}
	};

	const generators100 = {
		'T+T': () => {
			const a = randT();
			const b = randT((100 - a) / 10);
			return { text: formatExercise(a, '+', b) };
		},
		'T-T': () => {
			const a = randT();
			const b = randT(a / 10);
			return { text: formatExercise(a, '-', b) };
		},
		'T+E': () => ({ text: formatExercise(randT(), '+', randE()) }),
		'E+T': () => ({ text: formatExercise(randE(), '+', randT()) }),
		'TE-E=T': () => {
			const a = randTE(99);
			const b = a % 10;
			return { text: formatExercise(a, '-', b), rhs: a - b };
		},
		'TE-T=E': () => {
			const a = randTE(99);
			const b = Math.floor(a / 10) * 10;
			return { text: formatExercise(a, '-', b) };
		},
		'T+TE': () => {
			while (true) {
				const a = randT();
				const maxB = 100 - a;
				if (maxB >= 11) {
					const b = randTE(maxB);
					return { text: formatExercise(a, '+', b) };
				}
			}
		},
		'TE+T': () => {
			while (true) {
				const b = randT();
				const maxA = 100 - b;
				if (maxA >= 11) {
					const a = randTE(maxA);
					return { text: formatExercise(a, '+', b) };
				}
			}
		},
		'TE+E': () => {
			while (true) {
				const a = randTE(99);
				const maxB = 9 - (a % 10);
				if (maxB >= 1) {
					const b = randomInt(1, maxB);
					return { text: formatExercise(a, '+', b), rhs: a + b };
				}
			}
		},
		'E+TE': () => {
			while (true) {
				const b = randTE(99);
				const maxA = 9 - (b % 10);
				if (maxA >= 1) {
					return { text: formatExercise(randomInt(1, maxA), '+', b) };
				}
			}
		},
		'TE-E': () => {
			const a = randTE(99);
			const b = randomInt(1, a % 10);
			return { text: formatExercise(a, '-', b) };
		},
		'TE+TE': () => {
			while (true) {
				const a = randTE(99);
				const b = randTE(99);
				if (a + b <= 100 && (a % 10) + (b % 10) <= 9) {
					return { text: formatExercise(a, '+', b) };
				}
			}
		},
		'TE-TE': () => {
			while (true) {
				const a = randTE(99);
				const b = randTE(99);
				if (a >= b && (a % 10) >= (b % 10)) {
					return { text: formatExercise(a, '-', b) };
				}
			}
		},
		'TE-T=TE': () => {
			while (true) {
				const a = randTE(99);
				const aTens = Math.floor(a / 10);
				if (aTens < 2) {
					continue;
				}
				const b = randT(aTens - 1);
				const result = a - b;
				if (result >= 11 && result % 10 !== 0) {
					return { text: formatExercise(a, '-', b) };
				}
			}
		},
		'TE+E=T': () => {
			const a = randTE(99);
			const b = 10 - (a % 10);
			return { text: formatExercise(a, '+', b), rhs: a + b };
		},
		'TE+TE=T': () => {
			while (true) {
				const u1 = randE();
				const u2 = 10 - u1;
				const t1 = randomInt(1, 9);
				const t2 = randomInt(1, 9);
				const a = t1 * 10 + u1;
				const b = t2 * 10 + u2;
				if (a + b <= 100) {
					return { text: formatExercise(a, '+', b) };
				}
			}
		},
		'TE-TE=T': () => {
			while (true) {
				const u = randE();
				const t1 = randomInt(2, 9);
				const t2 = randomInt(1, t1 - 1);
				const a = t1 * 10 + u;
				const b = t2 * 10 + u;
				if (a > b) {
					return { text: formatExercise(a, '-', b) };
				}
			}
		},
		'T-E': () => ({ text: formatExercise(randT(), '-', randE()) }),
		'T-TE': () => {
			while (true) {
				const a = randT();
				const b = randTE(99);
				if (a > b) {
					return { text: formatExercise(a, '-', b) };
				}
			}
		},
		'TE+Emb': () => {
			while (true) {
				const a = randTE(99);
				const unit = a % 10;
				const minB = 10 - unit;
				const maxB = Math.min(9, 100 - a);
				if (minB <= maxB) {
					const b = randomInt(minB, maxB);
					return { text: formatExercise(a, '+', b) };
				}
			}
		},
		'TE-Emb': () => {
			while (true) {
				const a = randTE(99);
				const unit = a % 10;
				if (unit < 9) {
					const b = randomInt(unit + 1, 9);
					return { text: formatExercise(a, '-', b) };
				}
			}
		},
		'TE+TEmb': () => {
			while (true) {
				const a = randTE(99);
				const b = randTE(99);
				if (a + b <= 100 && (a % 10) + (b % 10) >= 10) {
					return { text: formatExercise(a, '+', b) };
				}
			}
		},
		'TE-TEmb': () => {
			while (true) {
				const a = randTE(99);
				const b = randTE(99);
				if (a > b && (a % 10) < (b % 10)) {
					return { text: formatExercise(a, '-', b) };
				}
			}
		},
		'H-T': () => ({ text: formatExercise(100, '-', randT()) }),
		'H-E': () => ({ text: formatExercise(100, '-', randE()) }),
		'H-TE': () => ({ text: formatExercise(100, '-', randTE(99)) })
	};

	const getGenerators = (max) => (max === '100' ? generators100 : generators20);

	const getSelectedTypes = (max) => {
		const selector = max === '100' ? '.tot100 input:checked' : '.tot20 input:checked';
		return Array.from(document.querySelectorAll(selector)).map((el) => el.name);
	};

	const buildExercises = (selectedTypes, max) => {
		const generators = getGenerators(max);
		const exercises = [];

		selectedTypes.forEach((type) => {
			const generator = generators[type];
			if (generator) {
				const result = generator();
				exercises.push(Object.assign({ type }, result));
			}
		});

		while (exercises.length < EXERCISE_COUNT) {
			const type = pick(selectedTypes);
			const generator = generators[type];
			const result = generator();
			exercises.push(Object.assign({ type }, result));
		}

		return shuffle(exercises).slice(0, EXERCISE_COUNT);
	};

	const initIndexPage = () => {
		const params = new URLSearchParams(window.location.search);
		const max = activeSection(params.get('max'));

		const section20 = document.querySelector('.tot20');
		const section100 = document.querySelector('.tot100');

		if (max === '100') {
			section20.classList.add('hidden');
			section100.classList.remove('hidden');
		} else {
			section20.classList.remove('hidden');
			section100.classList.add('hidden');
		}

		const button = document.querySelector('#generateButton');
		const error = document.querySelector('#selectionError');

		button.addEventListener('click', () => {
			const selectedTypes = getSelectedTypes(max);

			if (selectedTypes.length < 1) {
				error.classList.remove('hidden');
				return;
			}

			error.classList.add('hidden');

			const exercises = buildExercises(selectedTypes, max);
			const payload = {
				max,
				createdAt: new Date().toISOString(),
				exercises
			};

			sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
			window.location.href = 'worksheet.html';
		});
	};

	const initWorksheetPage = () => {
		const raw = sessionStorage.getItem(STORAGE_KEY);
		const list = document.querySelector('#exerciseList');
		const meta = document.querySelector('#worksheetMeta');
		const empty = document.querySelector('#emptyState');
		const printButton = document.querySelector('#printButton');

		if (!raw) {
			empty.classList.remove('hidden');
			return;
		}

		const data = JSON.parse(raw);
		const exercises = Array.isArray(data.exercises) ? data.exercises : [];

		if (exercises.length === 0) {
			empty.classList.remove('hidden');
			return;
		}

		const maxLabel = data.max === '100' ? 'tot 100' : 'tot 20';
		meta.textContent = `Tellen ${maxLabel}`;

		exercises.forEach((exercise) => {
			const match = exercise.text.match(/^(\d+)\s*([+-])\s*(\d+)\s*=\s*$/);
			if (!match) {
				return;
			}

			const [, firstNumber, operator, secondNumber] = match;
			const row = document.createElement('div');
			row.className = 'exercise-row';

			const first = document.createElement('span');
			first.className = 'term-a';
			first.textContent = firstNumber;

			const op = document.createElement('span');
			op.className = 'op';
			op.textContent = operator;

			const isFillUnit = exercise.type === 'TE+E=T' || exercise.type === 'TE-E=T';

			if (isFillUnit) {
				const blank = document.createElement('span');
				blank.className = 'term-b blank';
				blank.textContent = '';

				const eq = document.createElement('span');
				eq.className = 'eq';
				eq.textContent = '=';

				const target = document.createElement('span');
				target.className = 'answer-space';
				if (typeof exercise.rhs !== 'undefined') {
					target.textContent = String(exercise.rhs);
				} else {
					const a = parseInt(firstNumber, 10);
					const b = parseInt(secondNumber, 10);
					if (operator === '+') target.textContent = String(a + b);
					else target.textContent = String(a - b);
				}

				row.appendChild(first);
				row.appendChild(op);
				row.appendChild(blank);
				row.appendChild(eq);
				row.appendChild(target);
			} else {
				const second = document.createElement('span');
				second.className = 'term-b';
				second.textContent = secondNumber;

				const eq = document.createElement('span');
				eq.className = 'eq';
				eq.textContent = '=';

				const answer = document.createElement('span');
				answer.className = 'answer-space';

				row.appendChild(first);
				row.appendChild(op);
				row.appendChild(second);
				row.appendChild(eq);
				row.appendChild(answer);
			}

			list.appendChild(row);
		});

		printButton.addEventListener('click', () => {
			window.print();
		});
	};

	if (document.body.dataset.page === 'index') {
		initIndexPage();
	}

	if (document.body.dataset.page === 'worksheet') {
		initWorksheetPage();
	}
})();
