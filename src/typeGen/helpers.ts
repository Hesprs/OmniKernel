import {
	type ArrayLiteralExpression,
	type ClassDeclaration,
	type ClassExpression,
	type Identifier,
	type Node,
	type NumericLiteral,
	type ObjectLiteralExpression,
	type StringLiteral,
	SyntaxKind,
	type Type,
} from 'ts-morph';
import type { GeneralObject, Manifest } from '@/declarations';

export type MappedArgs = {
	[key: string]: string | MappedArgs;
};

export function findManifest(classDecl: ClassDeclaration | ClassExpression) {
	let argument: Manifest | undefined;
	classDecl.getDecorators().forEach(decorator => {
		if (decorator.isDecoratorFactory() && decorator.getFullName() === 'manifest')
			argument = getStaticValue(decorator.getArguments()[0]) as Manifest;
	});
	return argument;
}

function getStaticValue(node: Node): unknown {
	if (node.isKind(SyntaxKind.ObjectLiteralExpression)) {
		const obj: GeneralObject = {};
		const objExpr = node as ObjectLiteralExpression;

		for (const prop of objExpr.getProperties()) {
			if (prop.isKind(SyntaxKind.PropertyAssignment)) {
				const nameNode = prop.getNameNode();
				let key: string;

				// Handle string/number/computed keys (simplified: assume string literal or identifier)
				if (nameNode.isKind(SyntaxKind.StringLiteral)) {
					key = nameNode.getLiteralText();
				} else if (nameNode.isKind(SyntaxKind.NumericLiteral)) {
					key = nameNode.getLiteralText();
				} else if (nameNode.isKind(SyntaxKind.Identifier)) {
					key = nameNode.getText();
				} else {
					// Computed property (e.g., [someVar]) — not statically evaluable
					throw new Error(
						`Computed property keys are not supported in manifest: ${prop.getText()}`,
					);
				}

				const initializer = prop.getInitializer();
				if (!initializer) {
					throw new Error(`Missing value for property: ${key}`);
				}
				obj[key] = getStaticValue(initializer);
			} else if (prop.isKind(SyntaxKind.ShorthandPropertyAssignment)) {
				// { x } → shorthand for { x: x }
				// But `x` must be a constant in scope — **not safe in decorators**
				const ident = prop.getNameNode() as Identifier;
				throw new Error(`Shorthand properties not allowed in manifest: ${ident.getText()}`);
			} else if (prop.isKind(SyntaxKind.SpreadAssignment)) {
				// { ...other } — not statically analyzable
				throw new Error(`Spread properties not allowed in manifest: ${prop.getText()}`);
			}
		}

		return obj;
	}

	if (node.isKind(SyntaxKind.ArrayLiteralExpression)) {
		const arrExpr = node as ArrayLiteralExpression;
		return arrExpr.getElements().map(el => getStaticValue(el));
	}
	if (node.isKind(SyntaxKind.StringLiteral)) return (node as StringLiteral).getLiteralText();
	if (node.isKind(SyntaxKind.NumericLiteral)) return Number((node as NumericLiteral).getLiteralText());
	if (node.isKind(SyntaxKind.TrueKeyword)) return true;
	if (node.isKind(SyntaxKind.FalseKeyword)) return false;
	if (node.isKind(SyntaxKind.NullKeyword)) return null;

	// Unsupported node type
	throw new Error(`Cannot statically evaluate node: ${node.getText()}`);
}

export function mapRecursion(node: Node) {
	const type = node.getType();
	if (isObject(type)) {
		const result: MappedArgs = {};
		type.getProperties().forEach(prop => {
			result[prop.getName()] = mapRecursion(prop.getValueDeclaration() as Node);
		});
		return result;
	} else return type.getText();
}

const isObject = (toCheck: Type) => toCheck.getText()[0] === '{';

export function toFacadeString(toConvert: unknown) {
	let string = '';
	if (typeof toConvert === 'object' && toConvert !== null) {
		const selfType = 'value' in toConvert ? toConvert.value : 'undefined';
		string += `FacadeFunc<${selfType}> & { `;
		Object.entries(toConvert).forEach(([key, value]) => {
			if (key === 'value') return;
			string += `${key}: ${toFacadeString(value)}; `;
		});
		string += '[key: Indexable]: GeneralFunction }';
	} else string += `FacadeFunc<${toConvert}>`;
	return string;
}
