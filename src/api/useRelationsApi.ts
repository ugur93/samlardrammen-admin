import { useMutation, useQueryClient } from '@tanstack/react-query';
import supabase from '../supabase';
import { RelationInfoUpdateDatabase, RelationsResponse } from '../types/personTypes';
import { RelationType } from '../types/relationTypes';
import { QueryKeys } from './usePersonsApi';

interface AddRelationParams {
    personId: string;
    relatedPersonId: string;
    relationType: RelationType;
    hasAccess: boolean;
}

interface UpdateRelationParams {
    id?: number;
    relation_type: RelationType;
    has_access: boolean;
    personId: number;
    relatedPersonId: number;
}

export function useAddUpdateRelationMutation() {
    const qc = useQueryClient();

    const toRelationTypeRelatedPerson = (relationType: RelationType): RelationType => {
        switch (relationType) {
            case 'parent':
                return RelationType.KID;
            case 'kid':
                return RelationType.PARENT;
            default:
                return relationType;
        }
    };
    return useMutation({
        mutationFn: async (params: UpdateRelationParams) => {
            // Mock API call

            const request1: RelationInfoUpdateDatabase = {
                id: params.id,
                person_id: params.personId,
                person_related_id: params.relatedPersonId,
                relation_type: params.relation_type,
                has_access: params.has_access,
            };

            const request2: RelationInfoUpdateDatabase = {
                person_id: params.relatedPersonId,
                person_related_id: params.personId,
                relation_type: toRelationTypeRelatedPerson(params.relation_type),
            };
            if (request1.id === undefined) {
                delete request1.id;
                await supabase.from('person_relation').insert([request1]);
                await supabase.from('person_relation').insert([request2]);
            } else {
                await supabase
                    .from('person_relation')
                    .update(request1)
                    .eq('person_related_id', params.relatedPersonId)
                    .eq('person_id', params.personId);
                await supabase
                    .from('person_relation')
                    .update(request2)
                    .eq('person_related_id', params.personId)
                    .eq('person_id', params.relatedPersonId);
            }
            await qc.refetchQueries({ queryKey: QueryKeys.fetchPersonBy() });
            // Return a mock response
            return {
                id: params.id,
                relation_type: params.relation_type,
                has_access: params.has_access,
                updated_at: new Date().toISOString(),
            };
        },
    });
}

export function useDeleteRelationMutation() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (relationToDelete: RelationsResponse) => {
            await supabase
                .from('person_relation')
                .delete()
                .eq('person_id', relationToDelete.person_id)
                .eq('person_related_id', relationToDelete.person_related_id);
            await supabase
                .from('person_relation')
                .delete()
                .eq('person_id', relationToDelete.person_related_id)
                .eq('person_related_id', relationToDelete.person_id);
            await qc.resetQueries({ queryKey: QueryKeys.fetchPersonBy() });
            return { success: true };
        },
    });
}
