
const resolvers = {
    Mutation: {
        doAction: async (parent: any, args: any) => {
            console.log("doAction", args)
            return args
        }
    },
};

export default resolvers;