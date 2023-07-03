
class CheckLastEventStatus {
  constructor (private readonly loadLastEventRepository: LoadLastEventRepository) {}

  // loadLastEventRepository: LoadLastEventRepository
  // constructor (loadLastEventRepository: LoadLastEventRepository) {
  //   this.loadLastEventRepository = loadLastEventRepository
  // }    
    
  async perform (groupID: string): Promise<void> {
    await this.loadLastEventRepository.loadLastEvent('')
  }
}

interface LoadLastEventRepository {
  loadLastEvent: (groupID: string) => Promise<void>
}

// o mock ta preocupado apenas com o input de um repositorio para a aplicação funcionar
class LoadLastEventRepositoryMock implements LoadLastEventRepository {
  groupID?: string

  async loadLastEvent (groupID: string): Promise<void> {
    this.groupID = groupID
  }
}
  
describe('CheckLastEventStatus', () => {
  it('should get last event data', async () => {
    const loadLastEventRepository = new LoadLastEventRepositoryMock()
    const checkLastEventStatus = new CheckLastEventStatus(loadLastEventRepository)

    await checkLastEventStatus.perform('any_group_id')

    expect(loadLastEventRepository.groupID).toBe('any_group_id')
  })
})


