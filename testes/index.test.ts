//import { MockDate } from 'mockdate';
//import { set, reset } from 'mockdate';
//import MockDate from 'jest'


class CheckLastEventStatus {
  constructor(private readonly loadLastEventRepository: LoadLastEventRepository) { }

  // loadLastEventRepository: LoadLastEventRepository
  // constructor (loadLastEventRepository: LoadLastEventRepository) {
  //   this.loadLastEventRepository = loadLastEventRepository
  // }    

  //async perform(groupID: string): Promise<string> {  
  //a linha de cima é igual a linha a baixo so que usamos(embaixo) objetos como parametros para deixar escalavel 
  async perform ({ groupID }: {groupID: string }): Promise<string> {
    const event = await this.loadLastEventRepository.loadLastEvent({ groupID })
    //return event === undefined ? 'done' : 'active' //usado quando se tem 2 opções 

    const now = new Date()
/*
    //comparação acoplada
    if (event === undefined) return 'done'
    return event.dataFinal >= now ? 'active' : 'inReview' 
*/  

    //comparacao estendida, faz a mesma coisa que no caso acima 
    if (event === undefined) {
      return 'done'
    } else if (event.dataFinal >= now) {
      return 'active'
    } else {
      return 'inReview'
    }
  
  }
}

interface LoadLastEventRepository {
  loadLastEvent: (input: {groupID: string }) => Promise<{ 
    dataFinal: Date, 
    horarioRevisaoEmHoras: number, 
    horarioTerminoEventoEmHoras: number 
  } | undefined>
}

// o mock ta preocupado apenas com o input de um repositorio para a aplicação funcionar
class LoadLastEventRepositorySpy implements LoadLastEventRepository {
  groupID?: string
  callsCount = 0
  output?: { 
    dataFinal: Date, 
    horarioRevisaoEmHoras: number, 
    horarioTerminoEventoEmHoras: number
  }

  //para realizar uma abstração no codigo na hor do teste usamos o metodo a seguir
  setEndDateAfterNow () : void {
    this.output = {
      dataFinal: new Date(new Date().getTime() - 1),
      horarioRevisaoEmHoras: 1,
      horarioTerminoEventoEmHoras: 1
    }
  }

  async loadLastEvent ({ groupID }: {groupID: string }): Promise<{ 
    dataFinal: Date, 
    horarioRevisaoEmHoras: number, 
    horarioTerminoEventoEmHoras: number 
  } | undefined> {
    this.groupID = groupID
    this.callsCount++
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

  const groupID = 'any_group_id'
/*
  beforeAll(() => { 
    MockDate.set(Date)
  })

  afterAll(() => {
    MockDate.reset()
  })
*/
  it('retorna a data do ultimo evento', async () => {
    const { sut, loadLastEventRepository } = makeSut()

    await sut.perform({ groupID })

    expect(loadLastEventRepository.groupID).toBe(groupID)
    expect(loadLastEventRepository.callsCount).toBe(1)
    //permite chamar apenas uma verificação/comando  await this.loadLastEventRepository.loadLastEvent(groupID)

  })

  it('retorna o status "done" quando não temos eventos', async () => {
    const { sut, loadLastEventRepository } = makeSut()
    loadLastEventRepository.output = undefined

    const status = await sut.perform({ groupID })

    expect(status).toBe('done')

  })

  it('retorna o status "active" quando o tempo atual está antes do fim do evento', async () => {
    const { sut, loadLastEventRepository } = makeSut()
    loadLastEventRepository.setEndDateAfterNow()  

    const status = await sut.perform({ groupID })

    expect(status).toBe('active')
  })
  it('retorna o status "active" quando o tempo atual é igual ao fim do evento', async () => {
    const { sut, loadLastEventRepository } = makeSut()
    loadLastEventRepository.output = {
      dataFinal: new Date(),
      horarioRevisaoEmHoras: 1,
      horarioTerminoEventoEmHoras: 1
    }

    const status = await sut.perform({ groupID })

    expect(status).toBe('active')
  })


  it('retorna o status "emAnalise ou inReview" quando o tempo atual esta depois da hora do evento ', async () => {
    const { sut, loadLastEventRepository } = makeSut()
    loadLastEventRepository.output = {
      dataFinal: new Date(new Date().getTime() + 1),
      horarioRevisaoEmHoras: 1,
      horarioTerminoEventoEmHoras: 1
    }

    const status = await sut.perform({ groupID })

    expect(status).toBe('inReview')
  })
  it('retorna o status "emAnalise ou inReview" quando o tempo atual esta e antes do fim do horario de revisao', async () => {
    const { sut, loadLastEventRepository } = makeSut()
    loadLastEventRepository.output = {
      dataFinal: new Date(new Date().getTime() - 1),
      horarioRevisaoEmHoras: 1,
      horarioTerminoEventoEmHoras: 1
    }

    const status = await sut.perform({ groupID })

    expect(status).toBe('inReview')
  })
  it('retorna o status "emAnalise ou inReview" quando o tempo atual é igual hora do evento ', async () => {
    const { sut, loadLastEventRepository } = makeSut()
    loadLastEventRepository.output = {
      dataFinal: new Date(),
      horarioRevisaoEmHoras: 1,
      horarioTerminoEventoEmHoras: 1
    }

    const status = await sut.perform({ groupID })

    expect(status).toBe('inReview')
  })
  
  
  it('retorna o status "done" quando o tempo atual esta depois do fim do horario de revisao', async () => {
    const { sut, loadLastEventRepository } = makeSut()
    loadLastEventRepository.output = {
      dataFinal: new Date(new Date().getTime() + 1),
      horarioRevisaoEmHoras: 1,
      horarioTerminoEventoEmHoras: 1
    }

    const status = await sut.perform({ groupID })

    expect(status).toBe('inReview')
  })
  
})

