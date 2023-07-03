"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mockdate_1 = require("mockdate");
class CheckLastEventStatus {
    loadLastEventRepository;
    constructor(loadLastEventRepository) {
        this.loadLastEventRepository = loadLastEventRepository;
    }
    async perform(groupID) {
        const event = await this.loadLastEventRepository.loadLastEvent(groupID);
        return event === undefined ? 'done' : 'active';
    }
}
class LoadLastEventRepositorySpy {
    groupID;
    callsCount = 0;
    output;
    async loadLastEvent(groupID) {
        this.groupID = groupID;
        this.callsCount++;
        spyOn.name;
        return this.output;
    }
}
const makeSut = () => {
    const loadLastEventRepository = new LoadLastEventRepositorySpy();
    const sut = new CheckLastEventStatus(loadLastEventRepository);
    return {
        sut, loadLastEventRepository
    };
};
describe('CheckLastEventStatus', () => {
    beforeAll(() => {
        (0, mockdate_1.set)(new Date());
    });
    afterAll(() => {
        (0, mockdate_1.reset)(new Date());
    });
    it('should get last event data', async () => {
        const { sut, loadLastEventRepository } = makeSut();
        await sut.perform('any_group_id');
        expect(loadLastEventRepository.groupID).toBe('any_group_id');
        expect(loadLastEventRepository.callsCount).toBe(1);
    });
    it('retorna o status quando não temos eventos', async () => {
        const { sut, loadLastEventRepository } = makeSut();
        loadLastEventRepository.output = undefined;
        const status = await sut.perform('any_group_id');
        expect(status).toBe('done');
    });
    it('retorna o status quando o tempo atual esta antes do fim do evento ', async () => {
        const { sut, loadLastEventRepository } = makeSut();
        loadLastEventRepository.output = {
            dataFinal: new Date(new Date().getTime() + 1)
        };
        const status = await sut.perform('any_group_id');
        expect(status).toBe('active');
    });
});
//# sourceMappingURL=index.test.js.map