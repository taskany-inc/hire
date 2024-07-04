import { useRouter } from 'next/router';
import { ComponentType, useEffect, useRef, useState } from 'react';

import { LayoutMain } from '../components/LayoutMain/LayoutMain';

import { tr } from './plugins.i18n';

interface Plugin {
    default: ComponentType;
    pluginName: string;
}

const usePlugin = (importPath: string) => {
    const Component = useRef<ComponentType>(() => null);
    const pluginName = useRef<string>();

    const [_, setRefresh] = useState(0);

    useEffect(() => {
        const inner = async () => {
            try {
                const imported: Plugin = await import(`${importPath}`);

                Component.current = imported.default;
                pluginName.current = imported.pluginName;
            } catch (e) {
                Component.current = () => <span>Cannot import plugin {importPath}</span>;
            } finally {
                setRefresh((prev) => prev + 1);
            }
        };
        inner();
    }, [importPath]);

    return { Component: Component.current, pluginName: pluginName.current };
};

export const PluginPage = () => {
    const { query } = useRouter();

    const { Component, pluginName } = usePlugin(`./${query.name}`);

    return (
        <LayoutMain pageTitle={pluginName || tr('Plugins')}>
            <Component />
        </LayoutMain>
    );
};
