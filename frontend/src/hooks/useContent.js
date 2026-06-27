import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";

export const contentKeys = {
    classes: () => ["classes"],
    classDetail: (id) => ["classes", id],
    streams: () => ["streams"],
    streamDetail: (slug) => ["streams", slug],
    careers: (params) => ["careers", params || {}],
    careerDetail: (slug) => ["careers", slug],
    categories: () => ["categories"],
};

export function useClasses() {
    return useQuery({
        queryKey: contentKeys.classes(),
        queryFn: async () => (await api.get("/classes")).data,
    });
}
export function useClassDetail(id) {
    return useQuery({
        queryKey: contentKeys.classDetail(id),
        queryFn: async () => (await api.get(`/classes/${id}`)).data,
        enabled: !!id,
    });
}
export function useStreams() {
    return useQuery({
        queryKey: contentKeys.streams(),
        queryFn: async () => (await api.get("/streams")).data,
    });
}
export function useStreamDetail(slug) {
    return useQuery({
        queryKey: contentKeys.streamDetail(slug),
        queryFn: async () => (await api.get(`/streams/${slug}`)).data,
        enabled: !!slug,
    });
}
export function useCareers(params = {}) {
    return useQuery({
        queryKey: contentKeys.careers(params),
        queryFn: async () => (await api.get("/careers", { params })).data,
    });
}
export function useCareerDetail(slug) {
    return useQuery({
        queryKey: contentKeys.careerDetail(slug),
        queryFn: async () => (await api.get(`/careers/${slug}`)).data,
        enabled: !!slug,
    });
}
export function useCategories() {
    return useQuery({
        queryKey: contentKeys.categories(),
        queryFn: async () => (await api.get("/categories")).data,
    });
}
