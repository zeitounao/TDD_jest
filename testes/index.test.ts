import { reset, set } from 'mockdate';

class EventStatus {
  status: string

  constructor(event?: { dataFinal: Date, horarioRevisaoEmHoras: number }) {

    if (event === undefined) {
      this.status = 'done'
      return
    }
    const now = new Date();
    if (event.dataFinal >= now) {
      this.status = 'active'
      return
    }
    const duracaoRevisao = event.horarioRevisaoEmHoras * (60 * 60 * 1000);
    const horarioRevisao = new Date(event.dataFinal.getTime() + duracaoRevisao);
    this.status = horarioRevisao >= now ? 'inReview' : 'done'
  }
}

class CheckLastEventStatus {
  constructor(private readonly loadLastEventRepository: LoadLastEventRepository) { }
/*
  loadLastEventRepository: LoadLastEventRepository
  constructor(loadLastEventRepository: LoadLastEventRepository) {
    this.loadLastEventRepository = loadLastEventRepository
    F
  }
*/

  //async perform(groupID: string): Promise<string> {  
  //a linha de cima é igual a linha a baixo so que usamos(embaixo) objetos como parametros para deixar escalavel 

  async perform(groupID: string): Promise<EventStatus> {
    const event = await this.loadLastEventRepository.loadLastEvent({groupID});
    return new EventStatus(event);

    //return event === undefined ? 'done' : 'active' //usado quando se tem 2 opções

    //comparação acoplada com 3 operações 
    //    if (event === undefined) return 'done'
    //    return event.dataFinal >= now ? 'active' : 'inReview'

    /*
        //comparacao estendida, faz a mesma coisa que no caso acima 
        if (event === undefined) {
          return { status: 'done' }
        } else if (event.dataFinal >= now) {
          return { status: 'active' }
        } else {
          return { status: 'inReview' }
        }
    */

    //comparacao estendida, faz a mesma coisa que no caso acima,
    // so que mais claro de entender e com mais if 

    /*
        if (event === undefined) { 
          this.status = 'done'
        }  
        if (event.dataFinal >= now) { 
          this.status = 'active'
        }  
        if (horarioRevisao >= now) { 
          this.status = 'inReview'
        } 
        else {
          this.status = 'done'
        }
    */

  }
}

interface LoadLastEventRepository {
  loadLastEvent: (input: { groupID: string }) => Promise<{ //dar um jeito para nao retornar um objeto
    dataFinal: Date, horarioRevisaoEmHoras: number,
  } | undefined>
}

// o mock ta preocupado apenas com o input de um repositorio para a aplicação funcionar
class LoadLastEventRepositorySpy implements LoadLastEventRepository {
  groupID?: string
  callsCount = 0
  output?: {
    dataFinal: Date;
    horarioRevisaoEmHoras: number;
  };

  //para realizar uma abstração no codigo na hora do teste usamos o metodo a seguir
  agoraEstaAntesDaDataFinal(): void {
    this.output = {
      dataFinal: new Date(new Date().getTime() + 1),
      horarioRevisaoEmHoras: 1,
    }
  }
  agoraEstaIgualADataFinal(): void {
    this.output = {
      dataFinal: new Date(),
      horarioRevisaoEmHoras: 1,
    }
  }
  agoraEstaDepoisDaDataFinal(): void {
    this.output = {
      dataFinal: new Date(new Date().getTime() - 1),
      horarioRevisaoEmHoras: 1,
    }
  }

  async loadLastEvent({ groupID }: { groupID: string }): Promise<{  //dar um jeito para nao retornar um objeto
    dataFinal: Date,
    horarioRevisaoEmHoras: number,
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

  beforeAll(() => {
    set(new Date())
  })

  afterAll(() => {
    reset()
  })

  it('retorna a data do ultimo evento', async () => {
    const { sut, loadLastEventRepository } = makeSut()

    await sut.perform(groupID)

    expect(loadLastEventRepository.groupID).toBe(groupID)
    expect(loadLastEventRepository.callsCount).toBe(1)
    //permite chamar apenas uma verificação/comando  await this.loadLastEventRepository.loadLastEvent(groupID)

  })

  it('retorna o status "done" quando não temos eventos', async () => {
    const { sut, loadLastEventRepository } = makeSut()
    loadLastEventRepository.output = undefined

    const status = await sut.perform(groupID)

    expect(status).toBe('done')

  })

  it('retorna o status "active" quando o tempo atual está antes do fim do evento', async () => {
    const { sut, loadLastEventRepository } = makeSut()
    /* noo codigo abaixo é necessario passar o valos das tres variaveis, 
    se abstrairmos as informações nao seremos obrigados a colocar as informações,
    alem de padronizar partes do codigo e as informações   */
    /*  loadLastEventRepository.output = {
          dataFinal: new Date(new Date().getTime() + 1),
          horarioRevisaoEmHoras: 1,
          horarioTerminoEventoEmHoras: 1
        }
    */
    loadLastEventRepository.agoraEstaAntesDaDataFinal()

    const status = await sut.perform(groupID)

    expect(status).toBe('active')
  })

  it('retorna o status "active" quando o tempo atual é igual ao fim do evento', async () => {
    const { sut, loadLastEventRepository } = makeSut()
    loadLastEventRepository.agoraEstaIgualADataFinal()

    const status = await sut.perform(groupID)

    expect(status).toBe('active')
  })


  it('retorna o status "emAnalise ou inReview" quando o tempo atual esta depois da hora do evento ', async () => {
    const { sut, loadLastEventRepository } = makeSut()
    loadLastEventRepository.agoraEstaDepoisDaDataFinal()

    const status = await sut.perform(groupID)

    expect(status).toBe('inReview')
  })

  it('retorna o status "emAnalise ou inReview" quando o tempo atual esta antes do fim do horario de revisao', async () => {
    const horarioRevisaoEmHoras = 1
    const horarioRevisaoEmMili = (1 * 60 * 60 * 1000) * horarioRevisaoEmHoras
    const { sut, loadLastEventRepository } = makeSut()
    loadLastEventRepository.output = {
      dataFinal: new Date(new Date().getTime() - horarioRevisaoEmMili + 1),
      horarioRevisaoEmHoras: 1,
    }

    const status = await sut.perform(groupID)

    expect(status).toBe('inReview')
  })

  it('retorna o status "emAnalise ou inReview" quando o tempo atual é igual hora do evento ', async () => {
    const horarioRevisaoEmHoras = 1
    const horarioRevisaoEmMili = (1 * 60 * 60 * 1000) * horarioRevisaoEmHoras
    const { sut, loadLastEventRepository } = makeSut()
    loadLastEventRepository.output = {
      dataFinal: new Date(new Date().getTime() - horarioRevisaoEmMili),
      horarioRevisaoEmHoras: 1,
    }

    const status = await sut.perform(groupID)

    expect(status).toBe('inReview')
  })


  it('retorna o status "done" quando o tempo atual esta depois do fim do horario de revisao', async () => {
    const horarioRevisaoEmHoras = 1
    const horarioRevisaoEmMili = (1 * 60 * 60 * 1000) * horarioRevisaoEmHoras
    const { sut, loadLastEventRepository } = makeSut()
    loadLastEventRepository.output = {
      dataFinal: new Date(new Date().getTime() - horarioRevisaoEmMili - 1),
      horarioRevisaoEmHoras: 1,
    }

    const status = await sut.perform(groupID)

    expect(status).toBe('done')
  })

})

