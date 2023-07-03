
class CheckLastEventStatus {
  constructor(private readonly loadLastEventRepository: LoadLastEventRepository) { }

  // loadLastEventRepository: LoadLastEventRepository
  // constructor (loadLastEventRepository: LoadLastEventRepository) {
  //   this.loadLastEventRepository = loadLastEventRepository
  // }    

  async perform(groupID: string): Promise<void> {
    await this.loadLastEventRepository.loadLastEvent(groupID)

  }
}

interface LoadLastEventRepository {
  loadLastEvent: (groupID: string) => Promise<void>
}

// o mock ta preocupado apenas com o input de um repositorio para a aplicação funcionar
class LoadLastEventRepositoryMock implements LoadLastEventRepository {
  groupID?: string
  callsCount = 0

  async loadLastEvent(groupID: string): Promise<void> {
    this.groupID = groupID
    this.callsCount++
  }
}

describe('CheckLastEventStatus', () => {
  it('should get last event data', async () => {
    const loadLastEventRepository = new LoadLastEventRepositoryMock()
    const checkLastEventStatus = new CheckLastEventStatus(loadLastEventRepository)

    await checkLastEventStatus.perform('any_group_id')

    expect(loadLastEventRepository.groupID).toBe('any_group_id')
    expect(loadLastEventRepository.callsCount).toBe(1)

  })
})


