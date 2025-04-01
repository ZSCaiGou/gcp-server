import { DataSource, EntityManager } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { CreateResourceDto } from './dto/create-resource.dto';
import { UpdateResourceDto } from './dto/update-resource.dto';

@Injectable()
export class ResourceService {
  private readonly manager: EntityManager;
    constructor(private readonly dataSource: DataSource) {
        this.manager = this.dataSource.manager;
    }

    
}
