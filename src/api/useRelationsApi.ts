import { useMutation, useQueryClient } from '@tanstack/react-query';
import supabase from '../supabase';
import { RelationInfoUpdateDatabase } from '../types/personTypes';
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

    return useMutation({
        mutationFn: async (params: UpdateRelationParams) => {
            // Mock API call
            console.log('Updating relation with params:', params);

            const request: RelationInfoUpdateDatabase = {
                id: params.id,
                person_id: params.personId,
                person_related_id: params.relatedPersonId,
                relation_type: params.relation_type,
                has_access: params.has_access,
            };
            if (request.id === undefined) {
                delete request.id;
                await supabase.from('person_relation').insert([request]);
            } else {
                await supabase.from('person_relation').update(request).eq('id', params.id!);
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
        mutationFn: async (relationId: number) => {
            await supabase.from('person_relation').delete().eq('id', relationId);
            await qc.resetQueries({ queryKey: QueryKeys.fetchPersonBy() });
            return { success: true };
        },
    });
}
