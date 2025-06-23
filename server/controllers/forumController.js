const {ThemeForum, ThemeRelation} = require('../models/models');
const ApiError = require('../error/ApiError');
const sequelize = require('../db');
const { Op } = require('sequelize');

class ForumController {
    async create(req, res) {
        const transaction = await sequelize.transaction();
  
        try {
            const { title, parentId } = req.body;

            // Валидация
            if (!title) {
                await transaction.rollback();
                return res.status(400).json({ error: 'Title is required' });
            }

            // Создание темы
            const newTheme = await ThemeForum.create({ title }, { transaction });

            // 1. Всегда добавляем само-ссылку (depth=0)
            await ThemeRelation.create({
                parentId: newTheme.id,
                childId: newTheme.id,
                depth: 0
            }, { transaction });

            // 2. Если указан родитель
            if (parentId) {
                // Проверка существования родителя
                const parentTheme = await ThemeForum.findByPk(parentId, { transaction });
                if (!parentTheme) {
                    await transaction.rollback();
                    return res.status(404).json({ error: 'Parent theme not found' });
                }

                // Получаем ВСЕХ предков родителя (включая самого родителя)
                const parentRelations = await ThemeRelation.findAll({
                    where: { childId: parentId },
                    transaction
                });

                // 3. Создаем уникальные связи для новой темы
                const relationsMap = new Map();
                
                // Для каждого предка родителя создаем связь с новой темой
                for (const relation of parentRelations) {
                    const newDepth = relation.depth + 1;
                    const key = `${relation.parentId}-${newTheme.id}`;

                    // Проверяем уникальность связи
                    if (!relationsMap.has(key)) {
                        relationsMap.set(key, {
                            parentId: relation.parentId,
                            childId: newTheme.id,
                            depth: newDepth
                        });
                    }
                }

                // 4. Добавляем непосредственную связь с родителем (если еще не добавлена)
                const directKey = `${parentId}-${newTheme.id}`;
                if (!relationsMap.has(directKey)) {
                    relationsMap.set(directKey, {
                        parentId,
                        childId: newTheme.id,
                        depth: 1
                    });
                }

                // 5. Преобразуем Map в массив для bulkCreate
                const relationsToCreate = Array.from(relationsMap.values());
                
                await ThemeRelation.bulkCreate(relationsToCreate, { transaction });
            }

            await transaction.commit();
            
            // Форматируем ответ
            const result = {
                id: newTheme.id,
                title: newTheme.title,
                parentId: parentId || null,
                createdAt: newTheme.createdAt
            };

            res.status(201).json(result);

        } catch (error) {
            await transaction.rollback();
            console.error('Theme creation error:', error);
            
            if (error.name === 'SequelizeUniqueConstraintError') {
                return res.status(400).json({ error: 'Relation already exists' });
            }
            
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    async getAll(req, res) {
        const themes = await ThemeForum.findAll();
        return res.json(themes);
    }
}

module.exports = new ForumController()
