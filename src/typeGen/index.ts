import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { type Block, type ClassDeclaration, type ClassExpression, Project, SyntaxKind } from 'ts-morph';
import { manifest, OmniKernel, OmniUnit } from '@';
import type { GeneralObject, Manifest } from '@/declarations';
import { findManifest, type MappedArgs, mapRecursion, toFacadeString } from './helpers.ts';
import { traceReference } from './tracer';
import findClasses from './traverser';

type UnitsFound = Array<{
	calls: Array<{ name: Array<string>; arg: string | MappedArgs }>;
	manifest: Manifest;
}>;

function gen(filePath: string) {
	const project = new Project({
		tsConfigFilePath: 'tsconfig.json',
	});
	const units: UnitsFound = [];
	project.getSourceFiles(filePath).forEach(file => {
		for (const classNode of findClasses(file)) {
			const info = findConstructor(classNode);
			if (!info) continue;

			const calls = findRegisterCalls(info.body);
			units.push({ calls, manifest: info.manifest });
		}
	});
	const dummies: Array<ReturnType<typeof createDummyUnit>> = [];
	units.forEach(value => {
		dummies.push(createDummyUnit(value));
	});
	const Kernel = new OmniKernel(dummies);
	Kernel.bringUp();
	const mergedFacades = Kernel.getRunningUnits();
	const mergedTypes: Record<string, unknown> = {};
	Object.entries(mergedFacades).forEach(([key, value]) => {
		const merged = Kernel.normalize(value);
		if (merged instanceof OmniUnit) {
			mergedTypes[key] = undefined;
			return;
		}
		if ((merged as GeneralObject).value instanceof OmniUnit) delete (merged as GeneralObject).value;
		mergedTypes[key] = merged;
	});
	const facadeString: Array<string> = [];
	Object.entries(mergedTypes).forEach(([key, value]) => {
		facadeString.push(`type ${key}Facade = ${toFacadeString(value)};`);
	});
	const file = generateFullFile(units, facadeString);
	const outputPath = join(process.cwd(), 'omniTypes.ts');
	writeFileSync(outputPath, file, { encoding: 'utf-8' });
	console.log(`Generated ${outputPath}`);
}

function findConstructor(classDecl: ClassDeclaration | ClassExpression) {
	// Find @manifest decorator
	const manifest = findManifest(classDecl);
	if (!manifest) return;
	const ctor = classDecl.getConstructors()[0];
	if (!ctor) return;
	const body = ctor.getBody();
	if (!body || !body.isKind(SyntaxKind.Block)) return;

	console.log(`[OmniKernel TypeGen] Found OmniUnit: ${manifest.name}`);
	return { body, manifest };
}

// find register calls in constructors
function findRegisterCalls(body: Block) {
	const result: Array<{ name: Array<string>; arg: string | MappedArgs }> = [];
	for (const stmt of body.getStatements()) {
		stmt.forEachDescendant(node => {
			if (node.isKind(SyntaxKind.CallExpression)) {
				const propAccess = node.getExpression();

				if (traceReference(propAccess) !== 'this.Kernel.register') return;
				const args = node.getArguments();
				if (args.length < 2) return;

				const name = traceReference(args[1]);
				if (name !== 'this.facade' && !name?.includes('this.deps.')) return;

				result.push({ name: name.replace('this.', '').split('.'), arg: mapRecursion(args[0]) });
			}
		});
	}
	return result;
}

function createDummyUnit(info: {
	calls: Array<{ name: Array<string>; arg: string | MappedArgs }>;
	manifest: Manifest;
}) {
	return @manifest(info.manifest)
	class MergeTool extends OmniUnit<UnitArgs> {
		constructor(...args: UnitArgs) {
			super(...args);
			info.calls.forEach(call => {
				this.Kernel.register(call.arg, this.makeRegisterTarget(call.name));
			});
		}
		makeRegisterTarget = (crumb: Array<string>) => {
			let result: Facade = this as unknown as Facade;
			crumb.forEach(key => {
				result = result[key] as Facade;
			});
			return result;
		};
	};
}

function generateFullFile(units: UnitsFound, facadeString: Array<string>) {
	return `import type { OmniFacadeElement, OmniKernel, OmniUnit } from 'omnikernel';
type Indexable = string | number | symbol;
type Meta = {
	moduleName?: string;
	dependencies?: Array<string>;
	silent?: boolean;
	irreplaceable?: boolean;
	[key: Indexable]: unknown;
};
type FacadeMap = Record<string, OmniFacadeElement | OmniUnit<GeneralUnitArgs>>;
type GeneralUnitArgs = [
	GeneralFunction,
	Record<string, GeneralFunction>,
	OmniKernel,
	Meta | undefined,
	FacadeMap,
];
${facadeString.join('\n')}
${generateDepString(units).join('\n')}
${generateFullArg(units).join('\n')}
`;
}

function generateDepString(units: UnitsFound) {
	const result: Array<string> = [];
	units.forEach(unit => {
		let string = `type ${unit.manifest.name}Deps = { `;
		unit.manifest.dependsOn?.forEach(dep => {
			string += `${dep}: ${dep}Facade; `;
		});
		unit.manifest.requires?.forEach(dep => {
			string += `${dep}: ${dep}Facade; `;
		});
		string += '};';
		result.push(string);
	});
	return result;
}

function generateFullArg(units: UnitsFound) {
	const result: Array<string> = [];
	units.forEach(unit => {
		const name = unit.manifest.name;
		const string = `export type ${name}Args = [${name}Facade, ${name}Deps, OmniKernel, Meta | undefined, FacadeMap];`;
		result.push(string);
	});
	return result;
}

gen(process.argv[2]);
