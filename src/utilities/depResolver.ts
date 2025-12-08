import type { Unit } from '@/declarations';

export default function resolveDeps(
	depList: Record<string, Unit>,
	shouldBringUp: Array<string>,
): Array<string> {
	// Step 1: Validate initial modules exist
	for (const moduleName of shouldBringUp) {
		if (!(moduleName in depList))
			throw new Error(`[OmniKernel] Module "${moduleName}" not found in dependency list.`);
	}

	// Step 2: Build transitive closure using BOTH dependency types
	const requiredSet = new Set<string>();
	const queue = [...shouldBringUp];

	while (queue.length > 0) {
		const moduleName = queue.shift() as string;
		if (requiredSet.has(moduleName)) continue;

		requiredSet.add(moduleName);
		const unit = depList[moduleName];

		// Process BOTH hard and soft dependencies
		const allDeps = [...(unit.dependsOn || []), ...(unit.requires || [])];

		for (const dep of allDeps) {
			if (!(dep in depList)) {
				throw new Error(
					`[OmniKernel] Dependency "${dep}" of module "${moduleName}" not found in dependency list.`,
				);
			}
			if (!requiredSet.has(dep)) queue.push(dep);
		}
	}

	// Step 3: Build hard dependency graph (only dependsOn) and in-degree map
	const graph = new Map<string, string[]>();
	const inDegree = new Map<string, number>();

	// Initialize graph and in-degree for all required modules
	requiredSet.forEach(module => {
		graph.set(module, []);
		inDegree.set(module, 0);
	});

	// Populate graph using ONLY hard dependencies (dependsOn)
	requiredSet.forEach(module => {
		const hardDeps = depList[module].dependsOn || [];
		for (const dep of hardDeps) {
			// Skip dependencies not in our required set (shouldn't happen due to BFS above)
			if (!requiredSet.has(dep)) continue;

			// Add edge: dep -> module (dep must load before module)
			(graph.get(dep) as Array<string>).push(module);
			inDegree.set(module, (inDegree.get(module) as number) + 1);
		}
	});

	// Step 4: Kahn's algorithm with lexicographical ordering
	const available: string[] = [];
	requiredSet.forEach(module => {
		if (inDegree.get(module) === 0) available.push(module);
	});

	const result: string[] = [];

	while (available.length > 0) {
		// Sort lexicographically for deterministic order
		available.sort();
		const module = available.shift() as string;
		result.push(module);

		// Process dependents (modules that have this as a hard dependency)
		const dependents = graph.get(module) || [];
		for (const dependent of dependents) {
			const newDegree = (inDegree.get(dependent) as number) - 1;
			inDegree.set(dependent, newDegree);

			if (newDegree === 0) available.push(dependent);
		}
	}

	// Step 5: Verify all modules were processed (no hard dependency cycles)
	if (result.length !== requiredSet.size) {
		const unresolved = Array.from(requiredSet).filter(m => !result.includes(m));
		throw new Error(
			`[OmniKernel] Hard dependency cycle detected involving modules: ${unresolved.join(', ')}.`,
		);
	}

	return result;
}
