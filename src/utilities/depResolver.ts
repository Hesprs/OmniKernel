import type { Unit } from '@/declarations';

export default function depResolver(
	depList: Record<string, Unit>,
	shouldBringUp: Array<string>,
): Array<string> {
	// Step 1: Validate modules in shouldBringUp exist
	for (const moduleName of shouldBringUp) {
		if (!(moduleName in depList)) {
			throw new Error(`Module "${moduleName}" not found in dependency list`);
		}
	}

	// Step 2: Build transitive closure of required modules
	const requiredSet = new Set<string>();
	const queue = [...shouldBringUp];

	while (queue.length > 0) {
		const moduleName = queue.shift() as string;
		if (requiredSet.has(moduleName)) continue;

		requiredSet.add(moduleName);
		const unit = depList[moduleName];
		const dependencies = unit.dependsOn || [];

		for (const dep of dependencies) {
			if (!(dep in depList)) {
				throw new Error(`Dependency "${dep}" of module "${moduleName}" not found in dependency list`);
			}
			if (!requiredSet.has(dep)) queue.push(dep);
		}
	}

	// Step 3: Build dependency graph and in-degree map
	const graph = new Map<string, string[]>();
	const inDegree = new Map<string, number>();

	// Initialize graph and in-degree for all required modules
	requiredSet.forEach(module => {
		graph.set(module, []);
		inDegree.set(module, 0);
	});

	// Populate graph edges and update in-degrees
	requiredSet.forEach(module => {
		const dependencies = depList[module].dependsOn || [];
		for (const dep of dependencies) {
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
		// Sort available modules lexicographically for deterministic order
		available.sort();
		const module = available.shift() as string;
		result.push(module);

		// Process dependents of the current module
		const dependents = graph.get(module) || [];
		for (const dependent of dependents) {
			const newDegree = (inDegree.get(dependent) as number) - 1;
			inDegree.set(dependent, newDegree);

			if (newDegree === 0) available.push(dependent);
		}
	}

	// Step 5: Check for cycles
	if (result.length !== requiredSet.size) {
		const unresolved = Array.from(requiredSet).filter(m => !result.includes(m));
		throw new Error(`Cycle detected in dependencies involving modules: ${unresolved.join(', ')}`);
	}

	return result;
}
