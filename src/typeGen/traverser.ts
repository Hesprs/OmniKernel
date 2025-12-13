import { type ClassDeclaration, type ClassExpression, Node, type SourceFile, SyntaxKind } from 'ts-morph';

/**
 * Finds ALL manifest-decorated classes regardless of nesting depth
 * Works with current ts-morph API (v20+)
 */
export default function findAllManifestClasses(sourceFile: SourceFile) {
	const manifestClasses: (ClassDeclaration | ClassExpression)[] = [];
	const manifestIdentifiers = new Set<string>();

	// 1. Pre-collect all manifest identifiers from imports
	sourceFile.getImportDeclarations().forEach(importDecl => {
		const moduleSpecifier = importDecl.getModuleSpecifierValue();
		if (moduleSpecifier.startsWith('@') || moduleSpecifier.includes('OmniKernel')) {
			importDecl.getNamedImports().forEach(namedImport => {
				if (namedImport.getName() === 'manifest') {
					const alias = namedImport.getAliasNode()?.getText() || namedImport.getName();
					manifestIdentifiers.add(alias);
				}
			});
		}
	});

	// 2. Also check for global manifest in the file
	sourceFile.getDescendantsOfKind(SyntaxKind.Identifier).forEach(identifier => {
		if (identifier.getText() === 'manifest' && !manifestIdentifiers.has('manifest')) {
			const symbol = identifier.getSymbol();
			if (symbol && !symbol.getDeclarations()?.[0]?.getSourceFile().isDeclarationFile()) {
				manifestIdentifiers.add('manifest');
			}
		}
	});

	// 3. Deep traverse to find ALL class nodes with manifest decorators
	sourceFile.forEachDescendant(node => {
		// Handle class declarations
		if (Node.isClassDeclaration(node)) {
			if (hasManifestDecorator(node, manifestIdentifiers)) {
				manifestClasses.push(node);
			}
			return;
		}

		// Handle class expressions (CRITICAL FOR YOUR nestedDummy CASE)
		if (Node.isClassExpression(node)) {
			if (hasManifestDecorator(node, manifestIdentifiers)) {
				manifestClasses.push(node);
			}
		}
	});

	return manifestClasses;
}

/**
 * Checks if a class has a @manifest decorator
 */
function hasManifestDecorator(
	classNode: ClassDeclaration | ClassExpression,
	manifestIdentifiers: Set<string>,
): boolean {
	return classNode.getDecorators().some(decorator => {
		const expr = decorator.getExpression();

		// Case 1: Direct decorator (@manifest)
		if (Node.isIdentifier(expr)) {
			return manifestIdentifiers.has(expr.getText());
		}

		// Case 2: Called decorator (@manifest({...}))
		if (Node.isCallExpression(expr)) {
			const called = expr.getExpression();
			if (Node.isIdentifier(called)) {
				return manifestIdentifiers.has(called.getText());
			}
		}

		return false;
	});
}
