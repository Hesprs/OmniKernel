import { type Identifier, Node, type PropertyAccessExpression, SyntaxKind } from 'ts-morph';

const MAX_DEPTH = 5;

export function traceReference(node: Node, depth = 0): string | null {
	if (depth > MAX_DEPTH) return null;

	// Handle property access: obj.prop
	if (Node.isPropertyAccessExpression(node)) {
		return tracePropertyAccess(node, depth);
	}

	// Handle identifier: ref
	if (Node.isIdentifier(node)) {
		return traceIdentifier(node, depth);
	}

	// Stop at literals/complex expressions
	if (
		Node.isObjectLiteralExpression(node) ||
		Node.isArrayLiteralExpression(node) ||
		Node.isCallExpression(node)
	) {
		return null;
	}

	return node.getText();
}

function tracePropertyAccess(node: PropertyAccessExpression, depth: number): string | null {
	const expr = node.getExpression();
	const propName = node.getName();
	const base = traceReference(expr, depth + 1);

	// Special handling for object literals: { d: a }.d → trace 'a'
	if (expr.isKind(SyntaxKind.Identifier)) {
		const defs = expr.getDefinitionNodes();
		for (const def of defs) {
			if (!Node.isVariableDeclaration(def)) return null;
			const objLiteral = def.getInitializer();
			if (!objLiteral?.isKind(SyntaxKind.ObjectLiteralExpression)) return null;

			const prop = objLiteral.getProperty(propName);

			if (prop && Node.isPropertyAssignment(prop)) {
				const init = prop.getInitializer();
				if (init) {
					const traced = traceReference(init, depth + 1);
					if (traced) return traced;
				}
			}
		}
	}

	return base ? `${base}.${propName}` : propName;
}

function traceIdentifier(node: Identifier, depth: number): string | null {
	const defs = node.getDefinitionNodes();

	// Handle multiple definitions (take first relevant one)
	for (const def of defs) {
		if (Node.isVariableDeclaration(def)) {
			const init = def.getInitializer();
			if (init) {
				// Skip object literals at root identifier level
				if (Node.isObjectLiteralExpression(init)) {
					return node.getText();
				}

				const traced = traceReference(init, depth + 1);
				if (traced) return traced;
			}
		}

		// Handle parameter declarations
		if (Node.isParameterDeclaration(def)) {
			return node.getText();
		}
	}

	return node.getText();
}
