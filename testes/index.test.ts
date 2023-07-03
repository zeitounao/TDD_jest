import { set, reset } from 'mockdate';

class CheckLastEventStatus {
  constructor(private readonly loadLastEventRepository: LoadLastEventRepository) { }

  // loadLastEventRepository: LoadLastEventRepository
  // constructor (loadLastEventRepository: LoadLastEventRepository) {
  //   this.loadLastEventRepository = loadLastEventRepository
  // }    

  async perform(groupID: string): Promise<string> {
    const event = await this.loadLastEventRepository.loadLastEvent(groupID)
    return event === undefined ? 'done' : 'active'
  }
}

interface LoadLastEventRepository {
  loadLastEvent: (groupID: string) => Promise<{ dataFinal:  Date} | undefined>
}

// o mock ta preocupado apenas com o input de um repositorio para a aplicação funcionar
class LoadLastEventRepositorySpy implements LoadLastEventRepository {
  groupID?: string
  callsCount = 0
  output?: { dataFinal:  Date} 

  async loadLastEvent(groupID: string): Promise<{ dataFinal:  Date} | undefined> {
    this.groupID = groupID
    this.callsCount++
    spyOn.name
    return this.output
    
  }
}

type sutOutput = {
  sut: CheckLastEventStatus,
  loadLastEventRepository: LoadLastEventRepositorySpy
}
const makeSut = (): sutOutput => {
  const loadLastEventRepository = new LoadLastEventRepositorySpy()
  const sut = new CheckLastEventStatus(loadLastEventRepository)
  // por padrao, o sut veio substituir o checkLastEventStatus que é o que queremos testar

  return {
    sut, loadLastEventRepository
  }
}

describe('CheckLastEventStatus', () => {

  beforeAll(() => {
    set (new Date())
  })

  afterAll(() => {
    reset (new Date())
  })

  it('should get last event data', async () => {
    const { sut, loadLastEventRepository } = makeSut()

    await sut.perform('any_group_id')

    expect(loadLastEventRepository.groupID).toBe('any_group_id')
    expect(loadLastEventRepository.callsCount).toBe(1)
    //permite chamar apenas uma verificação/comando  await this.loadLastEventRepository.loadLastEvent(groupID)

  })

  it('retorna o status quando não temos eventos', async () => {
    const { sut, loadLastEventRepository } = makeSut()
    loadLastEventRepository.output = undefined

    const status = await sut.perform('any_group_id')

    expect(status).toBe('done')

  })

  it('retorna o status quando o tempo atual esta antes do fim do evento ', async () => {
    const { sut, loadLastEventRepository } = makeSut()
    loadLastEventRepository.output = {
      dataFinal: new Date( new Date().getTime() + 1)
    }
  
    const status = await sut.perform('any_group_id')
  
    expect(status).toBe('active')
  
  })

})

