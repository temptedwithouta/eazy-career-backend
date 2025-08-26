import Session from "../Domain/Session";
import SessionType from "../Domain/SessionType";
import SessionRepository from "../Repository/SessionRepository";
import SessionTypeRepository from "../Repository/SessionTypeRepository";
import ServerError from "../Error/ServerError";

export default class SessionService {
  private sessionRepository: SessionRepository;

  private sessionTypeRepository: SessionTypeRepository;

  public constructor(sessionRepository: SessionRepository, sessionTypeRepository: SessionTypeRepository) {
    this.sessionRepository = sessionRepository;

    this.sessionTypeRepository = sessionTypeRepository;
  }

  public create = async (userId: number, sessionTypeName: string, expired: number): Promise<Session> => {
    const sessionType: SessionType | null = await this.sessionTypeRepository.findByName(sessionTypeName);

    if (!sessionType) {
      throw new ServerError(500, `Failed to create - SessionService - create(userId: number, sessionTypeName: string): Session type not found`);
    }

    const sessionExpired: Date = new Date(Date.now() + expired);

    const dbResponseSessionFindByUserId: Session | null = await this.sessionRepository.findByUserId(userId);

    if (dbResponseSessionFindByUserId) {
      const session: Session = {
        id: dbResponseSessionFindByUserId.id,
        expiredAt: sessionExpired,
        userId: userId,
        sessionTypeId: sessionType.id,
      };

      const dbResponseSessionUpdate: Session = await this.sessionRepository.update(session);

      return dbResponseSessionUpdate;
    } else {
      const session: Session = {
        expiredAt: sessionExpired,
        userId: userId,
        sessionTypeId: sessionType.id,
      };

      const dbResponseSessionSave: Session = await this.sessionRepository.save(session);

      return dbResponseSessionSave;
    }
  };
}
