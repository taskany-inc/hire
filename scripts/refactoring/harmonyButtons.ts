import { Project, SyntaxKind } from 'ts-morph';

const project = new Project({});

project.addSourceFilesAtPaths('src/components/**/*.tsx');

const files = project.getSourceFiles();

// const isNeedChange = (value: string) => {
//     const layers = ['shared', 'entities.entities', 'features', 'pages', 'widgets', 'app'];
//     return layers.some((layer) => value.startsWith(layer));
// };

const componentName = 'Button';
files.forEach((sourceFile) => {
    sourceFile.getImportDeclarations().forEach((importDeclaration) => {
        const importString = importDeclaration.getFullText();
        if (importString.endsWith("'@taskany/bricks';") && importString.includes(componentName)) {
            let count = 0;
            importDeclaration.getDescendants().forEach((dec) => {
                if (dec.isKind(SyntaxKind.Identifier)) {
                    count++;
                }
            });
            // console.log(count);
            importDeclaration.getDescendants().forEach((dec) => {
                if (dec.wasForgotten()) return;
                if (dec.isKind(SyntaxKind.Identifier) && dec.getText() === componentName) {
                    dec.getNextSiblings().forEach((sib) => console.log(sib.getText()));
                    if (count > 1) {
                        importDeclaration.replaceWithText(
                            importDeclaration.getFullText().replace(`${componentName},`, ''),
                        );
                        sourceFile.addImportDeclaration({
                            namedImports: [componentName],
                            moduleSpecifier: '@taskany/bricks/harmony',
                        });
                    } else if (count !== 0 && count <= 1) {
                        sourceFile.addImportDeclaration({
                            namedImports: [componentName],
                            moduleSpecifier: '@taskany/bricks/harmony',
                        });
                        importDeclaration.remove();
                    }
                    count = 0;
                }
            });
        }
    });
});
project.save();
