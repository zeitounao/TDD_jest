
class CheckLastEventStatus {
  constructor(private readonly loadLastEventRepository: LoadLastEventRepository) { }

  // loadLastEventRepository: LoadLastEventRepository
  // constructor (loadLastEventRepository: LoadLastEventRepository) {
  //   this.loadLastEventRepository = loadLastEventRepository
  // }    

  async perform(groupID: string): Promise<string> {
    await this.loadLastEventRepository.loadLastEvent(groupID)
    return 'done'
  }
}

interface LoadLastEventRepository {
  loadLastEvent: (groupID: string) => Promise<undefined>
}

// o mock ta preocupado apenas com o input de um repositorio para a aplicação funcionar
class LoadLastEventRepositorySpy implements LoadLastEventRepository {
  groupID?: string
  callsCount = 0
  output: undefined

  async loadLastEvent(groupID: string): Promise<undefined> {
    this.groupID = groupID
    this.callsCount++
    return this.output
  }
}

describe('CheckLastEventStatus', () => {
  it('should get last event data', async () => {
    const loadLastEventRepository = new LoadLastEventRepositorySpy()
    const sut = new CheckLastEventStatus(loadLastEventRepository) 
    // por padrao, o sut veio substituir o checkLastEventStatus que é o que queremos testar   

    await sut.perform('any_group_id')

    expect(loadLastEventRepository.groupID).toBe('any_group_id')
    expect(loadLastEventRepository.callsCount).toBe(1)
    //permite chamar apenas uma verificação/comando  await this.loadLastEventRepository.loadLastEvent(groupID)

  })

  it('retorna o status quando não temos mais eventos', async () => {
    const loadLastEventRepository = new LoadLastEventRepositorySpy()
    loadLastEventRepository.output = undefined
    const sut = new CheckLastEventStatus(loadLastEventRepository)

    const status = await sut.perform('any_group_id')

    expect(status).toBe('done')

  })
})


