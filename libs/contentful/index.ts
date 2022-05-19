import contentful, { ClientAPI, createClient } from 'contentful-management';

class Contentful {
    private static PERSONAL_ACCESS_TOKEN =
        process.env.NEXT_PUBLIC_CONTENTFUL_PERSONAL_ACCESS_TOKEN || '';
    private static CLIENT?: ClientAPI;
    private static INSTANCE?: Contentful;
    private static SPACE_ID = process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID || '';
    private environment?: contentful.Environment;

    private constructor() {
        this.setEnvironment();
    }

    public static createInstance = (): Contentful => {
        if (Contentful.INSTANCE) {
            return Contentful.INSTANCE;
        }

        try {
            Contentful.CLIENT = createClient({
                // This is the access token for this space. Normally you get the token in the Contentful web app
                accessToken: Contentful.PERSONAL_ACCESS_TOKEN,
            });

            Contentful.INSTANCE = new Contentful();
        } catch (error) {
            console.error(error);
        }

        return Contentful.INSTANCE!;
    };

    public setEnvironment = async (
        environmentId?: string
    ): Promise<contentful.Environment | void> => {
        if (Contentful.CLIENT) {
            const space = await Contentful.CLIENT.getSpace(Contentful.SPACE_ID);
            const environment = await space.getEnvironment(
                environmentId || 'develop'
            );

            this.environment = environment;

            return this.environment;
        }
    };

    public get currentEnvironment(): contentful.Environment | undefined {
        return this.environment;
    }

    public uploadFile = async (fileBlob: Blob, fileName: string) => {
        const environment = this.environment ?? (await this.setEnvironment());

        if (environment) {
            const asset = await environment.createAssetFromFiles({
                fields: {
                    title: {
                        'en-US': `Asset_${fileName}`,
                    },
                    description: {
                        'en-US': `Asset_${fileName} Description`,
                    },
                    file: {
                        'en-US': {
                            contentType: 'image/jpeg',
                            fileName: fileName,
                            file: await fileBlob.arrayBuffer(),
                        },
                    },
                },
            });

            if (asset) {
                const processedAsset = await asset.processForAllLocales();
                const publishedAsset = await processedAsset.publish();

                return publishedAsset;
            }
        }
    };
}

export const contentfulInstance = Contentful.createInstance();
